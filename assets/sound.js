const ROOMS = {
  entrance: { wind: 0.23, cutoff: 680, tone: 0.002, pitch: 98 },
  hall: { wind: 0, cutoff: 240, tone: 0, pitch: 110, file: '8bit_palace_edit_76s.wav', level: 3 },
  library: { wind: 0, cutoff: 180, tone: 0, pitch: 110, file: '8bit_library_edit_90s.wav', level: 2.8 },
  workshop: { wind: 0, cutoff: 320, tone: 0, pitch: 123.47, file: '8bit_magicSchool_edit_60s.wav', level: 3.5 },
  doors: { wind: 0, cutoff: 460, tone: 0, pitch: 98, file: '8bit_nightsea_edit_82s.wav', level: 4.2 },
};

export class CollegeSound {
  constructor() {
    this.enabled = false;
    this.room = 'entrance';
    this.reading = false;
    this.context = null;
    this.sources = [];
    this.voice = null;
    this.fadeEnd = null;
    this.revision = 0;
    this.destroyed = false;
    this.musicAbort = new AbortController();
    this.onVisibility = () => {
      const context = this.context;
      if (!context || context.state === 'closed') return;
      if (document.hidden || !this.enabled) {
        void context.suspend().catch(() => {});
      } else {
        void context.resume().then(() => {
          if (document.hidden || !this.enabled) return context.suspend();
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  async setEnabled(enabled) {
    if (this.destroyed) return false;
    // Persisted preference alone must never start sound on a new page load.
    if (enabled && (document.hidden || globalThis.navigator?.userActivation?.isActive === false)) {
      return false;
    }
    const revision = ++this.revision;
    this.cancelFadeEnd();
    if (!enabled) {
      this.enabled = false;
      if (!this.context || this.context.state === 'closed') return true;
      this.target(this.master.gain, 0, 0.025);
      if (document.hidden || this.context.state !== 'running') {
        await this.context.suspend().catch(() => {});
      } else {
        // An audio-clock event ends the fade without a JavaScript timer.
        const marker = this.context.createBufferSource();
        marker.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
        marker.connect(this.master);
        marker.onended = () => {
          marker.disconnect();
          if (this.fadeEnd === marker) this.fadeEnd = null;
          if (revision === this.revision && !this.enabled) {
            void this.context.suspend().catch(() => {});
          }
        };
        this.fadeEnd = marker;
        marker.start(this.context.currentTime + 0.16);
      }
      return true;
    }

    try {
      if (!this.context) {
        const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContext) return false;
        this.context = new AudioContext();
        this.buildAmbience();
      }
      this.enabled = true;
      const resumed = this.context.resume();
      if (!this.loadingMusic) this.musicReady = this.buildMusic();
      await resumed;
      if (revision !== this.revision || this.destroyed) {
        if (!this.enabled && this.context.state !== 'closed') await this.context.suspend();
        return false;
      }
      this.target(this.master.gain, 0.4, 0.12);
      if (document.hidden) {
        await this.context.suspend();
      }
      return true;
    } catch {
      if (revision === this.revision) this.enabled = false;
      return false;
    }
  }

  buildAmbience() {
    const context = this.context;
    this.master = context.createGain();
    this.master.gain.value = 0;
    this.master.connect(context.destination);
    this.noise = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const samples = this.noise.getChannelData(0);
    for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;

    const wind = context.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    this.windFilter = context.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.Q.value = 0.5;
    this.windGain = context.createGain();
    this.windGain.gain.value = 0;
    wind.connect(this.windFilter).connect(this.windGain).connect(this.master);
    wind.start();
    this.sources.push(wind);

    this.tones = [1, 1.5, 2].map((ratio, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.detune.value = index % 2 ? -2 : 2;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(this.master);
      oscillator.start();
      this.sources.push(oscillator);
      return { oscillator, gain, ratio };
    });
    this.music = {};
    this.setRoom(this.room);
  }

  async buildMusic() {
    const context = this.context;
    const cancelled = () => this.destroyed || context.state === 'closed';
    const pending = Object.keys(ROOMS).filter(id => ROOMS[id].file && !this.music[id]);
    // Start the current room first; a slow or broken file must not block other rooms.
    if (pending.includes(this.room)) pending.unshift(...pending.splice(pending.indexOf(this.room), 1));
    this.loadingMusic = true;
    const results = await Promise.all(pending.map(async id => {
      try {
        const response = await fetch(new URL(`./audio/${ROOMS[id].file}`, import.meta.url), { signal: this.musicAbort.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        if (cancelled()) return false;
        const buffer = await context.decodeAudioData(bytes);
        if (cancelled()) return false;
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        source.loop = true;
        gain.gain.value = 0;
        source.connect(gain).connect(this.master);
        source.start();
        this.sources.push(source);
        this.music[id] = { source, gain };
        this.target(gain.gain, this.room === id ? (this.reading ? 0.28 : 0.7) * ROOMS[id].level : 0, 0.4);
        return true;
      } catch (error) {
        if (!cancelled()) console.warn(`Could not load ${id} music; toggle sound to retry.`, error);
        return false;
      }
    }));
    this.loadingMusic = false;
    return results.every(Boolean);
  }

  target(parameter, value, duration) {
    const now = this.context.currentTime;
    const current = parameter.value;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(current, now);
    parameter.setTargetAtTime(value, now, duration);
  }

  setRoom(roomId) {
    if (!Object.hasOwn(ROOMS, roomId)) return;
    this.room = roomId;
    if (!this.context || this.destroyed) return;
    const room = ROOMS[roomId];
    this.target(this.windGain.gain, room.wind, 0.4);
    this.target(this.windFilter.frequency, room.cutoff, 0.4);
    for (const tone of this.tones) {
      this.target(tone.gain.gain, room.tone / tone.ratio, 0.4);
      this.target(tone.oscillator.frequency, room.pitch * tone.ratio, 0.4);
    }
    for (const [id, music] of Object.entries(this.music)) {
      this.target(music.gain.gain, id === roomId ? (this.reading ? 0.28 : 0.7) * room.level : 0, 0.4);
    }
  }

  setReading(reading) {
    this.reading = reading;
    this.setRoom(this.room);
  }

  effect(kind) {
    const context = this.context;
    if (!this.enabled || document.hidden || !context || context.state !== 'running') return;
    const effects = {
      paper: { noise: true, frequency: 1800, duration: 0.25, volume: 0.12 },
      rune: { frequency: 392, duration: 0.65, volume: 0.035 },
      tool: { noise: true, frequency: 1100, duration: 0.16, volume: 0.10 },
      door: { noise: true, frequency: 260, duration: 0.55, volume: 0.16 },
      talk: { frequency: 523.25, duration: 0.10, volume: 0.012 },
    };
    if (!Object.hasOwn(effects, kind)) return;
    // One effect voice keeps rapid page turns and repeated clicks bounded.
    this.stopVoice();
    const effect = effects[kind];
    const now = context.currentTime;
    const source = effect.noise ? context.createBufferSource() : context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = 'lowpass';
    filter.Q.value = 0.5;
    filter.frequency.value = effect.frequency;
    if (effect.noise) {
      source.buffer = this.noise;
    } else {
      source.type = 'triangle';
      source.frequency.value = effect.frequency;
      source.frequency.exponentialRampToValueAtTime(effect.frequency * 0.75, now + effect.duration);
      filter.frequency.value = 1400;
    }
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(effect.volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + effect.duration);
    source.connect(filter).connect(gain).connect(this.master);
    const voice = { source, filter, gain };
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
      if (this.voice === voice) this.voice = null;
    };
    this.voice = voice;
    source.start();
    source.stop(now + effect.duration + 0.02);
  }

  stopVoice() {
    if (!this.voice) return;
    const { source, filter, gain } = this.voice;
    source.onended = null;
    source.stop();
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
    this.voice = null;
  }

  cancelFadeEnd() {
    if (!this.fadeEnd) return;
    this.fadeEnd.onended = null;
    this.fadeEnd.stop();
    this.fadeEnd.disconnect();
    this.fadeEnd = null;
  }

  destroy() {
    this.destroyed = true;
    this.musicAbort.abort();
    this.enabled = false;
    this.revision++;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.cancelFadeEnd();
    this.stopVoice();
    for (const source of this.sources) {
      source.stop();
      source.disconnect();
    }
    this.sources = [];
    if (this.context && this.context.state !== 'closed') {
      return this.context.close().catch(() => {});
    }
    return Promise.resolve();
  }
}
