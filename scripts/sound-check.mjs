import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CollegeSound } from '../assets/sound.js';

// The supplied maker exports canonical 44-byte, mono PCM16 WAV headers.
function decodeWav(bytes) {
  const view = new DataView(bytes);
  const text = (start, end) => String.fromCharCode(...new Uint8Array(bytes, start, end-start));
  assert.equal(text(0,4), 'RIFF'); assert.equal(text(8,12), 'WAVE');
  assert.equal(text(12,16), 'fmt '); assert.equal(view.getUint32(16,true),16);
  assert.equal(view.getUint16(20,true),1); assert.equal(view.getUint16(22,true),1);
  assert.equal(view.getUint16(34,true),16); assert.equal(text(36,40),'data');
  const sampleRate = view.getUint32(24,true), length = view.getUint32(40,true)/2;
  assert.equal(sampleRate,44100); assert.equal(bytes.byteLength,44+length*2);
  const samples = new Float32Array(length);
  for (let i=0;i<length;i++) samples[i]=view.getInt16(44+i*2,true)/32768;
  return { length, sampleRate, duration:length/sampleRate, getChannelData:()=>samples };
}
const requests = [];
let failure = '';
const fileFetch = async (url, { signal }) => {
  requests.push(url.pathname);
  if (url.pathname.includes(failure) && failure) return { ok:false, status:404 };
  const bytes = await fs.readFile(url, { signal });
  return { ok:true, arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) };
};
globalThis.fetch = fileFetch;
const listeners = new Map();
globalThis.document = {
  hidden: false,
  addEventListener: (name, callback) => listeners.set(name, callback),
  removeEventListener: name => listeners.delete(name),
};
Object.defineProperty(globalThis.navigator, 'userActivation', { value: { isActive: true }, configurable: true });
const parameter = () => ({ value: 0, cancelScheduledValues() {}, setValueAtTime(value) { this.value = value; }, setTargetAtTime(value) { this.value = value; }, linearRampToValueAtTime(value) { this.value = value; }, exponentialRampToValueAtTime(value) { this.value = value; } });
class AudioContextMock {
  constructor() { this.sampleRate = 22050; this.currentTime = 0; this.state = 'suspended'; this.destination = {}; this.nodes = []; }
  createGain() { return { gain: parameter(), connect() { return this; }, disconnect() {} }; }
  createBiquadFilter() { return { ...this.createGain(), frequency: parameter(), Q: parameter() }; }
  createBufferSource() {
    const node = { ...this.createGain(), start() { this.started = true; }, stop() { this.stopped = true; } };
    this.nodes.push(node);
    return node;
  }
  createOscillator() { return { ...this.createBufferSource(), frequency: parameter(), detune: parameter() }; }
  createBuffer(channels, length, sampleRate) {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return { length, sampleRate, duration: length / sampleRate, getChannelData: channel => data[channel] };
  }
  async decodeAudioData(bytes) { return decodeWav(bytes); }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async close() { this.state = 'closed'; }
}
globalThis.AudioContext = AudioContextMock;
const sound = new CollegeSound();
assert.equal(sound.enabled, false);
assert.equal(sound.context, null, 'Muted startup allocates no audio');
globalThis.navigator.userActivation.isActive = false;
assert.equal(await sound.setEnabled(true), false, 'Playback requires user activation');
globalThis.navigator.userActivation.isActive = true;
assert.equal(await sound.setEnabled(true), true);
assert.equal(sound.windGain.gain.value, 0.23, 'Keep approved entrance wind');
assert.equal(sound.windFilter.frequency.value, 680);
assert.deepEqual(sound.tones.map(tone => tone.oscillator.frequency.value), [98, 147, 196]);
assert.equal(Object.keys(sound.music).length, 0, 'Activation returns before loading music');
assert.equal(sound.context.state, 'running', 'Resume occurs on the activation task');
sound.setRoom('hall');
assert.equal(sound.windGain.gain.value, 0, 'Indoor BGM must not be continuous white noise');
assert.equal(sound.tones.every(tone => tone.gain.gain.value === 0), true, 'Indoor BGM must not be a static low drone');
assert.equal(await sound.musicReady, true);
assert.equal(Object.keys(sound.music).length, 4, 'Every interior needs a musical loop');

const expected = { hall: [96*60/76, 3], library: [90, 2.8], workshop: [60, 3.5], doors: [96*60/70, 4.2] };
for (const [room, { source }] of Object.entries(sound.music)) {
  sound.setRoom(room);
  assert.equal(sound.windGain.gain.value, 0, `${room}: no wind bed`);
  assert(source.loop && source.started);
  assert(Math.abs(source.buffer.duration-expected[room][0]) < 1/44100, `${room}: correct WAV mapping`);
  const samples = source.buffer.getChannelData(0);
  let energy = 0, peak = 0;
  for (const sample of samples) { energy += sample * sample; peak = Math.max(peak, Math.abs(sample)); }
  const rms = Math.sqrt(energy / samples.length);
  assert(rms > 0.005 && rms < 0.15, `${room}: non-silent recording`);
  assert(peak < 0.99, `${room}: no clipped samples`);
  assert(peak * expected[room][1] < 0.65, `${room}: playback headroom`);
  assert(Math.abs(samples[0] - samples.at(-1)) < 0.02, `${room}: loop sample boundary`);
  assert.equal(sound.music[room].gain.gain.value, 0.7 * expected[room][1]);
  console.log(`${room}: ${source.buffer.duration.toFixed(2)}s, RMS ${rms.toFixed(4)}, peak ${peak.toFixed(4)}`);
}
sound.setRoom('library');
sound.setReading(true);
assert.equal(sound.music.library.gain.gain.value, 0.28 * 2.8, 'Book reading lowers music');
assert.equal(sound.music.hall.gain.gain.value, 0, 'Reading does not unmute another room');
sound.setReading(false);
assert.equal(sound.music.library.gain.gain.value, 0.7 * 2.8, 'Closing restores music');
const count = sound.sources.length;
for (let index = 0; index < 100; index++) sound.setRoom(['hall', 'library', 'workshop', 'doors', 'entrance'][index % 5]);
assert.equal(sound.sources.length, count, 'Room changes reuse a bounded set of sources');
sound.effect('paper');
const firstVoice = sound.voice;
sound.effect('rune');
assert(firstVoice.source.stopped, 'Repeated effects stop the previous voice');
document.hidden = true;
listeners.get('visibilitychange')();
assert.equal(sound.context.state, 'suspended');
document.hidden = false;
listeners.get('visibilitychange')();
await Promise.resolve();
assert.equal(sound.context.state, 'running');
const enabling = sound.setEnabled(true);
await sound.setEnabled(false);
assert.equal(await enabling, false, 'Stale resume cannot override mute');
assert.equal(sound.enabled, false);
assert.equal(sound.context.state, 'suspended');
assert.equal(await sound.setEnabled(true), true);
await sound.destroy();
assert.equal(sound.context.state, 'closed');
assert.equal(sound.sources.length, 0);
assert.equal(listeners.size, 0);
assert.equal(await sound.setEnabled(true), false);
const interrupted = new CollegeSound();
interrupted.setRoom('library');
await interrupted.setEnabled(true);
const nodesBeforeDestroy = interrupted.context.nodes.length;
await interrupted.destroy();
assert.equal(await interrupted.musicReady, false, 'Destroy cancels unfinished loading');
assert.equal(interrupted.context.nodes.length, nodesBeforeDestroy, 'No new sources after destroy');
assert.equal(interrupted.sources.length, 0);
requests.length = 0;
const priority = new CollegeSound();
priority.setRoom('library');
await priority.setEnabled(true);
await priority.musicReady;
assert(requests[0].endsWith('8bit_library_edit_90s.wav'), 'Request the current interior first');
await priority.destroy();

// Missing files leave the remaining tracks/effects usable and retry on opt-in.
failure = 'palace';
const warning = console.warn;
const warnings = [];
console.warn = (...args) => warnings.push(args);
const partial = new CollegeSound();
await partial.setEnabled(true);
assert.equal(await partial.musicReady, false);
assert.equal(Object.keys(partial.music).length, 3);
partial.effect('paper');
assert(partial.voice.source.started);
assert.equal(warnings.length, 1);
failure = '';
requests.length = 0;
await partial.setEnabled(false);
await partial.setEnabled(true);
assert.equal(await partial.musicReady, true);
assert.equal(requests.length, 1, 'Retry only missing tracks');
assert.equal(Object.keys(partial.music).length, 4);
await partial.destroy();
console.warn = warning;

// Late responses must obey the latest room/reading/mute state, without duplication.
let release;
const gate = new Promise(resolve => { release = resolve; });
globalThis.fetch = async (...args) => { await gate; return fileFetch(...args); };
const late = new CollegeSound();
await late.setEnabled(true);
const loading = late.musicReady;
await late.setEnabled(true);
assert.equal(late.musicReady, loading, 'Concurrent opt-in shares pending loads');
late.setRoom('workshop'); late.setRoom('library'); late.setReading(true);
await late.setEnabled(false);
late.fadeEnd.onended();
release();
await loading;
assert.equal(late.context.state, 'suspended', 'Late decode cannot unmute');
assert.equal(late.music.library.gain.gain.value, 0.28 * 2.8);
assert.equal(late.music.workshop.gain.gain.value, 0);
assert.equal(late.sources.length, 8, 'One bounded source per track plus ambience');
await late.destroy();

// Decode failure is isolated just like a network failure.
globalThis.fetch = async (url, options) => url.pathname.includes('nightsea')
  ? { ok:true, arrayBuffer:async()=>new ArrayBuffer(0) } : fileFetch(url, options);
console.warn = () => {};
const corrupt = new CollegeSound();
await corrupt.setEnabled(true);
assert.equal(await corrupt.musicReady, false);
assert.equal(Object.keys(corrupt.music).length, 3);
await corrupt.destroy();
console.warn = warning;
console.log('PASS: four WAVs, levels, loop boundaries, gesture, mute, visibility, late loads, cancellation, retry and bounded sources.');
