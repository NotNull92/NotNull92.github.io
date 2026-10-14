import { getLanguage, setLanguage, localize } from './language.js';
import { BookReader, requestGate, beginIfChanged } from './book.js';
import { CollegeSound } from './sound.js';
import { projects } from './project-records.js';

const scene = document.querySelector('#scene');
const foreground = document.querySelector('#scene-foreground');
const art = document.querySelector('#scene-art');
const fade = document.querySelector('#scene-art-fade');
const ambience = document.querySelector('#scene-ambience');
const ledger = document.querySelector('#room-ledger');
const staffDialog = document.querySelector('#staff-dialog');
const bookDialog = document.querySelector('#book-dialog');
const soundButton = document.querySelector('#sound-toggle');
const motionButton = document.querySelector('#motion-toggle');
const notice = document.querySelector('#notice');
const entranceHTML = foreground.innerHTML;
const sound = new CollegeSound();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 700px)');
const rooms = {
  entrance: { number: '01', title: 'The Studio Approach', description: 'Ember Studio’s frost-covered northern office overlooking the sea at twilight', hint: 'A light is still on. Come inside.', staff: [] },
  hall: { number: '02', title: 'The Studio Hall', description: 'Every good game begins with a small question. This is where Ember Studio plans what to build next.', hint: 'Meet the team, or take a closer look around the studio.', staff: ['julie', 'bara'] },
  library: { number: '03', title: 'The Project Archive', description: 'Two games in development, presented as records from the Ember Studio archive. Choose a project and read its story.', hint: 'Choose a project record. Its story and development notes are yours to explore.', staff: ['pixie'] },
  workshop: { number: '04', title: 'The Development Workshop', description: 'This is where designs become playable builds. Mora implements them, and Star tests what happens next.', hint: 'Touch a workbench item to find a trace of the team’s current work.', staff: ['mora', 'star'] },
  doors: { number: '05', title: 'The Open Doors', description: 'The studio continues beyond this office. Follow our work, join the conversation, or look behind the scenes.', hint: 'Each doorway leads to an official Ember Studio channel.', staff: ['jenny'] }
};
const staff = {
  julie: { name: 'Julie', role: 'Design / systems', room: 'hall', greeting: 'Oh, welcome to the studio. I was just deciding whether this idea needs one more rule… or one fewer.', detail: 'I look after game design and systems. A good rule should give you an interesting choice, then get out of your way.' },
  bara: { name: 'Bara', role: 'Production / scope', room: 'hall', greeting: 'Come in. There is room for one more curious mind. Just mind the stack of perfectly reasonable deadlines.', detail: 'I keep the work small enough to finish and clear enough to share. Even an ambitious game needs a sensible production plan.' },
  pixie: { name: 'Pixie', role: 'Pixel / sprite art', room: 'library', greeting: 'Psst. The project records are open. Pick one! I left the interesting bits between the pages. And maybe a pixel or two.', detail: 'I work on pixels and sprites. One tiny shape, the right colour, and suddenly a little character has something to say.' },
  mora: { name: 'Mora', role: 'Implementation', room: 'workshop', greeting: 'That sound? Progress. Probably. Give me a moment and I will make it happen twice, just to be sure.', detail: 'I turn designs into things you can actually play. The satisfying part is when all those small systems finally agree.' },
  star: { name: 'Star', role: 'QA', room: 'workshop', greeting: 'Welcome. Everything on this table has been tested. The table itself is next.', detail: 'I look for the awkward edge cases: the click too early, the step out of order, the thing nobody expected you to try.' },
  jenny: { name: 'Jenny', role: 'Marketing', room: 'doors', greeting: 'Heading out? Take a little of the warmth with you. I can point you toward our latest work and conversations.', detail: 'I help our games find their people. Small updates, honest stories, and a place to talk about what comes next.' }
};
const destinations = [
  ['Discord', 'Join the conversation', 'https://discord.gg/VkAFZHyUn', 'M4 5h16v12H9l-5 4V5Zm4 5h1m3 0h1m3 0h1'],
  ['YouTube', 'Watch the work', 'https://www.youtube.com/@emberstudioo', 'M4 5h16v14H4V5Zm6 4 6 3-6 3V9Z'],
  ['Threads', 'Notes from the studio', 'https://www.threads.com/@emberstudio26', 'M17 7c-6-6-15 0-11 10 2 5 12 5 13-1 1-6-10-8-10-3 0 5 7 3 7-2 0-3-2-4-5-3'],
  ['GitHub', 'Look under the hood', 'https://github.com/NotNull92', 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18']
];
const traces = {
  pixels: 'Pixie leaves three tiny colour studies in the margin.',
  build: 'Mora’s instrument settles into a clean, repeating pattern.',
  test: 'Star marks one more case checked. Then adds another.'
};
const toolFx = {
  build: '<span class="tool-fx tool-build" aria-hidden="true"><i></i><i></i><i></i></span>',
  test: '<span class="tool-fx tool-test" aria-hidden="true"><i></i></span>',
  pixels: '<span class="tool-fx tool-pixels" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'
};
const CROSSFADE = 320;
const pausePath = 'M7 5h3v14H7V5Zm7 0h3v14h-3V5Z';
const playPath = 'M8 5v14l11-7Z';

function saved(key) { try { return localStorage.getItem(key); } catch { return null; } }
function remember(key, value) { try { localStorage.setItem(key, value); } catch { /* The studio remains usable without storage. */ } }
function glyph(path, className = '') { return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`; }
function actor(id, x, y = 12, mobileX = x) { const person = staff[id]; return `<button class="actor" data-staff="${id}" style="--x:${x}%;--y:${y}%;--mobile-x:${mobileX}%" aria-label="Talk to ${person.name}"><img src="assets/characters/${id}-sprite.webp" width="410" height="640" alt=""><span class="talk-symbol" aria-hidden="true">···</span><span class="actor-plaque">${person.name}<small>${person.role}</small></span></button>`; }
function path(room, x, y, mobileX = x) { return `<a class="room-path scene-link" href="#${room}" style="--x:${x}%;--y:${y}%;--mobile-x:${mobileX}%"><span class="hotspot-dot" aria-hidden="true"></span><span>${rooms[room].title} ↗</span></a>`; }
function tool(id, label, x, y, mx = x, my = y) { return `<button class="tool" data-tool="${id}" style="--x:${x}%;--y:${y}%;--mobile-x:${mx}%;--mobile-y:${my}%">${glyph('m4 20 4-1L20 7l-3-3L5 16l-1 4ZM14 7l3 3')}<span>${label}</span></button>`; }
function books() { return `<div class="library-books">${projects.map(project => `<button class="volume" data-book="${project.id}" aria-label="Open ${project.title} project record"><span class="book-ribbon" aria-hidden="true"></span><span class="volume-cover"><span class="volume-number">PROJECT ${project.number}</span>${glyph(project.id === 'golem' ? 'M8 2h8v5H8V2ZM5 9h14v5H5V9ZM2 16h9v6H2v-6Zm11 0h9v6h-9v-6Z' : 'M5 3h14v19H5V3ZM2 22h20M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 22v-4h4v4', 'cover-sigil')}<strong>${project.title}</strong><small>A work in progress</small></span><span class="volume-caption"><span>↗</span> OPEN PROJECT RECORD</span></button>`).join('')}</div>`; }
function glow(x, y, size, cycle) { return `<i class="candle-glow" style="--x:${x}%;--y:${y}%;--size:${size}%;--cycle:${cycle}s"></i>`; }

let roomId = 'entrance';
let noticeTimer;
let fxTimers = [];
let staffOpener;
const conversation = requestGate();
const artGate = requestGate();
const runeGate = requestGate();
const toolGate = requestGate();
let motionOptIn = saved('ember-motion-paused') === 'false';
let motionPaused = saved('ember-motion-paused') === null ? reduced.matches : saved('ember-motion-paused') === 'true';

function motionAllowed() { return !motionPaused; }
function modalOpen() { return staffDialog.open || bookDialog.open; }

const reader = new BookReader(bookDialog, {
  onEffect: () => { sound.setReading(true); sound.effect('paper'); },
  canTurn: () => motionAllowed()
});

function later(ms, fn) {
  const id = setTimeout(fn, ms);
  fxTimers.push(id);
  return id;
}

function clearFxTimers() {
  fxTimers.forEach(clearTimeout);
  fxTimers = [];
}

function clearNotice() {
  clearTimeout(noticeTimer);
  notice.classList.remove('visible');
  notice.textContent = '';
}

function showNotice(message) {
  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.classList.add('visible');
  localize(notice);
  noticeTimer = setTimeout(() => { notice.classList.remove('visible'); notice.textContent = ''; }, 3600);
}

function clearFade() {
  if (!fade) return;
  fade.getAnimations().forEach(animation => animation.cancel());
  fade.classList.remove('is-fading');
  fade.removeAttribute('src');
}

function clearTransient(snap = false) {
  clearFxTimers();
  runeGate.cancel();
  toolGate.cancel();
  foreground.querySelectorAll('.tool-fx, .rune-spark, .rune-wave').forEach(node => node.remove());
  foreground.getAnimations().forEach(animation => { if (snap) animation.finish(); else animation.cancel(); });
  clearFade();
}

function syncMotionClasses() {
  const paused = !motionAllowed();
  const optIn = !paused && motionOptIn;
  document.documentElement.classList.toggle('motion-paused', paused);
  document.documentElement.classList.toggle('motion-opt-in', optIn);
  document.documentElement.classList.toggle('modal-open', modalOpen());
  scene.classList.toggle('motion-paused', paused);
  scene.classList.toggle('motion-opt-in', optIn);
}

function sceneSource() {
  return `assets/scenes/${roomId === 'entrance' && mobile.matches ? 'entrance-mobile' : roomId}.webp`;
}

function updateArt() {
  const src = sceneSource();
  art.alt = roomId === 'entrance' ? rooms.entrance.description : `The ${rooms[roomId].title.replace('The ', '').toLowerCase()} of Ember Studio, lit by candles and cold northern light`;
  localize(art);
  const request = beginIfChanged(art.getAttribute('data-scene'), src, artGate);
  if (request === null) return;
  if (fade) fade.getAnimations().forEach(animation => animation.cancel());
  const previous = art.getAttribute('data-scene');
  art.setAttribute('data-scene', src);

  const reveal = () => {
    if (!artGate.isCurrent(request)) return;
    clearFade();
  };

  if (!previous || !fade || !motionAllowed() || document.hidden) {
    art.src = src;
    reveal();
    return;
  }

  fade.src = art.currentSrc || art.src;
  fade.classList.add('is-fading');
  art.src = src;

  const crossfade = () => {
    if (!artGate.isCurrent(request)) return;
    if (!motionAllowed() || document.hidden) { reveal(); return; }
    fade.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CROSSFADE, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })
      .finished.then(reveal)
      .catch(reveal);
  };
  art.decode().then(crossfade, crossfade);
}

function renderAmbience() {
  if (!ambience) return;
  const narrow = mobile.matches;
  const bits = [];
  if (roomId === 'hall') {
    bits.push(
      glow(narrow ? 16 : 13, narrow ? 64 : 57, 7, 5.2),
      glow(50, narrow ? 36 : 29, 6, 6.6),
      glow(narrow ? 34 : 38, 49, 4.5, 4.8),
      glow(narrow ? 66 : 62, 49, 4.5, 5.6)
    );
  }
  if (roomId === 'library') {
    bits.push(glow(22, 60, 5, 6.2), glow(78, 60, 4.5, 5.4));
    const count = narrow ? 5 : 8;
    for (let i = 0; i < count; i++) {
      bits.push(`<i class="dust" style="--left:${40 + (i * 19) % 22}%;--top:${14 + (i * 13) % 26}%;--cycle:${12 + i % 6}s;--delay:-${i * 2.2}s;--drift:${8 + (i % 4) * 4}px"></i>`);
    }
  }
  if (roomId === 'workshop') {
    bits.push(
      glow(narrow ? 20 : 16, 48, 5, 5.8),
      glow(50, 46, 5.5, 6.4),
      glow(narrow ? 80 : 84, 54, 4.5, 4.7)
    );
  }
  ambience.innerHTML = bits.join('');
}

function renderRoom(next, focus = false) {
  if (!Object.hasOwn(rooms, next)) return;
  conversation.cancel();
  clearTransient();
  clearNotice();
  reader.close();
  if (staffDialog.open) staffDialog.close();
  roomId = next;
  const room = rooms[next];
  scene.dataset.room = next;
  updateArt();
  let content = '';
  if (next === 'entrance') content = entranceHTML;
  else {
    content = `<div class="room-caption"><p class="eyebrow">EMBER STUDIO / ${room.number}</p><h1 id="room-title" tabindex="-1">${room.title}</h1><p class="room-description">${room.description}</p></div><a class="back-path" href="#${next === 'hall' ? 'entrance' : 'hall'}">← ${next === 'hall' ? 'The bridge' : 'The studio hall'}</a>`;
    if (next === 'hall') content += actor('julie', 22, 12, 23) + actor('bara', 78, 12, 78) + path('library', 50, 34, 30) + path('workshop', 86, 32, 76) + `<button class="rune-control" aria-label="Align the studio seal"><span class="rune" aria-hidden="true"><i></i><i></i><i></i></span><span class="rune-label">CHECK THE STUDIO SEAL</span></button>`;
    if (next === 'library') content += books() + actor('pixie', 85, 10) + tool('pixels', 'Pixie’s concept sketch', 73, 35, 8, 39);
    if (next === 'workshop') content += actor('mora', 28, 12, 24) + actor('star', 72, 12, 77) + tool('build', 'Mora’s build console', 13, 34, 8, 37) + tool('test', 'Star’s QA notes', 71, 34, 55, 37);
    if (next === 'doors') content += `<div class="portal-row">${destinations.map(([name, detail, href, icon]) => `<a class="outbound-portal" href="${href}"><span class="portal-glyph">${glyph(icon)}</span><strong>${name} ↗</strong><small>${detail}</small></a>`).join('')}</div>` + actor('jenny', 91, 5);
  }
  foreground.innerHTML = content;
  renderAmbience();
  syncMotionClasses();
  foreground.getAnimations().forEach(animation => animation.cancel());
  if (motionAllowed() && !document.hidden) foreground.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: CROSSFADE, easing: 'cubic-bezier(.22,1,.36,1)' });
  document.querySelector('#room-coordinate').textContent = `${room.number} / ${room.title.toUpperCase()}`;
  document.querySelectorAll('.quick-nav a').forEach(link => {
    if (link.dataset.room === next) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  ledger.innerHTML = `<p><span class="ledger-dot" aria-hidden="true"></span>${room.hint}</p><div class="ledger-links">${room.staff.map(id => `<button data-staff="${id}">Talk to ${staff[id].name}</button>`).join('')}${next === 'entrance' ? '<a href="https://discord.gg/VkAFZHyUn">Join our Discord ↗</a>' : ''}</div>`;
  document.querySelector('#wayfinding').textContent = next === 'entrance' ? 'Choose a doorway. Follow your curiosity.' : 'We’ll remember where you were working.';
  document.title = next === 'entrance' ? 'Ember Studio — The Living Studio' : `${room.title} — Ember Studio`;
  remember('ember-room', next);
  sound.setRoom(next);
  localize();
  if (focus) { document.querySelector('#room-title').setAttribute('tabindex', '-1'); document.querySelector('#room-title').focus({ preventScroll: true }); sound.effect('door'); }
}

function fillConversation(person, id) {
  document.querySelector('#staff-role').textContent = person.role;
  document.querySelector('#staff-name').textContent = person.name;
  const line = document.querySelector('#staff-line');
  line.textContent = person.greeting;
  line.classList.remove('line-fresh');
  const options = document.querySelector('#staff-options');
  options.replaceChildren();
  const work = document.createElement('button');
  work.className = 'control'; work.textContent = 'What are you working on?';
  work.addEventListener('click', () => {
    line.textContent = person.detail;
    line.classList.remove('line-fresh');
    if (motionAllowed()) { void line.offsetWidth; line.classList.add('line-fresh'); }
    localize(staffDialog);
    sound.effect('talk');
  });
  options.append(work);
  if (id === 'jenny') { const community = document.createElement('a'); community.className = 'control'; community.href = destinations[0][2]; community.textContent = 'Join the conversation ↗'; options.append(community); }
}

async function openConversation(id) {
  const person = staff[id];
  if (!person) return;
  const request = conversation.start();
  const portrait = document.querySelector('#staff-portrait');
  const portraitSource = `assets/characters/${id}-portrait.webp`;
  if (portrait.getAttribute('src') !== portraitSource) {
    portrait.removeAttribute('src');
    portrait.alt = '';
  }
  fillConversation(person, id);
  staffOpener = document.activeElement;
  if (!staffDialog.open) staffDialog.showModal();
  localize(staffDialog);
  document.querySelector('[data-close-dialog]').focus();
  syncMotionClasses();
  sound.effect('talk');
  const portraitImage = new Image();
  portraitImage.src = portraitSource;
  try { await portraitImage.decode(); } catch { /* The dialogue can still show its text if an image fails. */ }
  if (!conversation.isCurrent(request) || !staffDialog.open) return;
  portrait.src = portraitSource;
  portrait.alt = `${person.name}, ${person.role}`;
  localize(staffDialog);
}

function markStaff(id) {
  foreground.querySelectorAll('.actor.selected').forEach(node => node.classList.remove('selected'));
  foreground.querySelector(`[data-staff="${id}"]`)?.classList.add('selected');
}

function playRune(target) {
  const token = runeGate.start();
  target.querySelectorAll('.rune-spark, .rune-wave').forEach(node => node.remove());
  target.classList.remove('active');
  void target.offsetWidth;
  target.classList.add('active');
  sound.effect('rune');
  showNotice('For a moment, the scattered lines remember their shape.');
  if (!motionAllowed()) return;
  target.querySelector('.rune')?.insertAdjacentHTML('beforeend', '<span class="rune-wave" aria-hidden="true"></span><span class="rune-spark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>');
  later(700, () => {
    if (!runeGate.isCurrent(token)) return;
    target.querySelectorAll('.rune-spark, .rune-wave').forEach(node => node.remove());
  });
  later(1800, () => {
    if (!runeGate.isCurrent(token)) return;
    target.classList.remove('active');
  });
}

function playTool(target) {
  const id = target.dataset.tool;
  target.querySelector('.tool-fx, .tool-marks')?.remove();
  target.insertAdjacentHTML('beforeend', toolFx[id]);
  const fx = target.querySelector('.tool-fx');
  if (!motionAllowed()) fx?.classList.add('settled');
  sound.effect('tool');
  showNotice(traces[id]);
  later(800, () => { fx?.remove(); });
}

function interact(event) {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.staff) { markStaff(target.dataset.staff); openConversation(target.dataset.staff); }
  if (target.dataset.book) { target.classList.add('selected'); reader.open(target.dataset.book); syncMotionClasses(); }
  if (target.classList.contains('rune-control')) playRune(target);
  if (target.dataset.tool) playTool(target);
}

document.querySelector('[data-close-dialog]').addEventListener('click', () => staffDialog.close());
staffDialog.addEventListener('close', () => {
  foreground.querySelectorAll('.actor.selected').forEach(node => node.classList.remove('selected'));
  syncMotionClasses();
  if (!bookDialog.open && staffOpener?.isConnected) staffOpener.focus({ preventScroll: true });
});
foreground.addEventListener('click', interact);
ledger.addEventListener('click', interact);
bookDialog.addEventListener('close', () => {
  sound.setReading(false);
  foreground.querySelectorAll('.selected').forEach(book => book.classList.remove('selected'));
  syncMotionClasses();
});
let wantsSound = saved('ember-sound') === 'true';
function updateSoundButton() {
  soundButton.setAttribute('aria-pressed', String(sound.enabled));
  soundButton.querySelector('span').textContent = sound.enabled ? 'Sound on' : 'Sound off';
  soundButton.title = sound.enabled ? 'Mute ambient sound' : 'Enable ambient sound';
  localize(soundButton);
}
soundButton.addEventListener('click', async () => {
  wantsSound = !sound.enabled;
  const success = await sound.setEnabled(wantsSound);
  remember('ember-sound', String(sound.enabled)); updateSoundButton();
  if (wantsSound && !success) showNotice('Sound is unavailable in this browser. You can keep exploring the studio.');
});
document.addEventListener('click', event => { if (wantsSound && !sound.enabled && !event.target.closest('#sound-toggle')) sound.setEnabled(true).then(updateSoundButton); }, { once: true });
window.addEventListener('hashchange', () => { const next = location.hash.slice(1); if (Object.hasOwn(rooms, next)) renderRoom(next, true); });
mobile.addEventListener('change', () => { updateArt(); renderAmbience(); });
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
  if (document.hidden) {
    reader.stopTurn();
    clearTransient(true);
  }
  syncMotionClasses();
});
document.addEventListener('click', event => {
  if (event.target.closest('[data-language]')) { reader.stopTurn(); setLanguage(getLanguage() === 'en' ? 'ko' : 'en'); }
});
const weather = document.querySelector('.scene-weather');
weather.innerHTML = '<div class="aurora-veil"></div><div class="hearth-glow"></div>' + Array.from({ length: 28 }, (_, index) => '<i class="snowflake" style="--left:' + ((index * 37) % 110) + '%;--cycle:' + (10 + index % 13) + 's;--delay:-' + (index * 1.7) + 's;--size:' + (index % 3 + 1) + 'px"></i>').join('');

function updateMotion() {
  if (!motionAllowed()) {
    reader.stopTurn();
    clearTransient(true);
  }
  const motionLabel = motionPaused ? 'Play animation' : 'Pause animation';
  motionButton.querySelector('span').textContent = motionLabel;
  motionButton.querySelector('path').setAttribute('d', motionPaused ? playPath : pausePath);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.setAttribute('aria-label', motionLabel);
  motionButton.title = motionLabel;
  syncMotionClasses();
  localize(motionButton);
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; motionOptIn = !motionPaused; remember('ember-motion-paused', String(motionPaused)); updateMotion(); });
reduced.addEventListener('change', () => {
  if (reduced.matches) { motionPaused = true; motionOptIn = false; remember('ember-motion-paused', 'true'); updateMotion(); }
});
updateMotion();
const requested = location.hash.slice(1);
const initial = Object.hasOwn(rooms, requested) ? requested : Object.hasOwn(rooms, saved('ember-room')) ? saved('ember-room') : 'entrance';
history.replaceState(null, '', `#${initial}`);
renderRoom(initial);
