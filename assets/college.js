import { getLanguage, setLanguage, localize } from './language.js';
import { BookReader } from './book.js';
import { CollegeSound } from './sound.js';
import { projects } from './project-records.js';

const scene = document.querySelector('#scene');
const foreground = document.querySelector('#scene-foreground');
const art = document.querySelector('#scene-art');
const ledger = document.querySelector('#room-ledger');
const staffDialog = document.querySelector('#staff-dialog');
const soundButton = document.querySelector('#sound-toggle');
const notice = document.querySelector('#notice');
const entranceHTML = foreground.innerHTML;
const sound = new CollegeSound();
const reader = new BookReader(document.querySelector('#book-dialog'), { onEffect: () => { sound.setReading(true); sound.effect('paper'); } });
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
function saved(key) { try { return localStorage.getItem(key); } catch { return null; } }
function remember(key, value) { try { localStorage.setItem(key, value); } catch { /* The studio remains usable without storage. */ } }
function glyph(path, className = '') { return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`; }
function actor(id, x, y = 12, mobileX = x) { const person = staff[id]; return `<button class="actor" data-staff="${id}" style="--x:${x}%;--y:${y}%;--mobile-x:${mobileX}%" aria-label="Talk to ${person.name}"><img src="assets/characters/${id}-sprite.webp" width="410" height="640" alt=""><span class="talk-symbol" aria-hidden="true">···</span><span class="actor-plaque">${person.name}<small>${person.role}</small></span></button>`; }
function path(room, x, y, mobileX = x) { return `<a class="room-path scene-link" href="#${room}" style="--x:${x}%;--y:${y}%;--mobile-x:${mobileX}%"><span class="hotspot-dot" aria-hidden="true"></span><span>${rooms[room].title} ↗</span></a>`; }
function tool(id, label, x, y, mx = x, my = y) { return `<button class="tool" data-tool="${id}" style="--x:${x}%;--y:${y}%;--mobile-x:${mx}%;--mobile-y:${my}%">${glyph('m4 20 4-1L20 7l-3-3L5 16l-1 4ZM14 7l3 3')}<span>${label}</span></button>`; }
function books() { return `<div class="library-books">${projects.map(project => `<button class="volume" data-book="${project.id}" aria-label="Open ${project.title} project record"><span class="book-ribbon" aria-hidden="true"></span><span class="volume-cover"><span class="volume-number">PROJECT ${project.number}</span>${glyph(project.id === 'golem' ? 'M8 2h8v5H8V2ZM5 9h14v5H5V9ZM2 16h9v6H2v-6Zm11 0h9v6h-9v-6Z' : 'M5 3h14v19H5V3ZM2 22h20M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 22v-4h4v4', 'cover-sigil')}<strong>${project.title}</strong><small>A work in progress</small></span><span class="volume-caption"><span>↗</span> OPEN PROJECT RECORD</span></button>`).join('')}</div>`; }
let roomId = 'entrance';
let noticeTimer;
let staffOpener;
let conversationRequest = 0;
function showNotice(message) { clearTimeout(noticeTimer); notice.textContent = message; notice.classList.add('visible'); localize(notice); noticeTimer = setTimeout(() => { notice.classList.remove('visible'); notice.textContent = ''; }, 3600); }
function updateArt() {
  art.src = `assets/scenes/${roomId === 'entrance' && mobile.matches ? 'entrance-mobile' : roomId}.webp`;
  art.alt = roomId === 'entrance' ? rooms.entrance.description : `The ${rooms[roomId].title.replace('The ', '').toLowerCase()} of Ember Studio, lit by candles and cold northern light`;
  localize(art);
}
function renderRoom(next, focus = false) {
  if (!Object.hasOwn(rooms, next)) return;
  conversationRequest++;
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
    if (next === 'hall') content += actor('julie', 22, 12, 23) + actor('bara', 78, 12, 78) + path('library', 50, 34, 30) + path('workshop', 86, 32, 76) + `<button class="rune-control" aria-label="Align the studio seal"><span class="rune" aria-hidden="true"><i></i><i></i><i></i></span><span>CHECK THE STUDIO SEAL</span></button>`;
    if (next === 'library') content += books() + actor('pixie', 85, 10) + tool('pixels', 'Pixie’s concept sketch', 73, 35, 8, 39);
    if (next === 'workshop') content += actor('mora', 28, 12, 24) + actor('star', 72, 12, 77) + tool('build', 'Mora’s build console', 13, 34, 8, 37) + tool('test', 'Star’s QA notes', 71, 34, 55, 37);
    if (next === 'doors') content += `<div class="portal-row">${destinations.map(([name, detail, href, icon]) => `<a class="outbound-portal" href="${href}"><span class="portal-glyph">${glyph(icon)}</span><strong>${name} ↗</strong><small>${detail}</small></a>`).join('')}</div>` + actor('jenny', 91, 5);
  }
  foreground.innerHTML = content;
  foreground.getAnimations().forEach(animation => animation.cancel());
  if (!reduced.matches) foreground.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
  document.querySelector('#room-coordinate').textContent = `${room.number} / ${room.title.toUpperCase()}`;
  document.querySelectorAll('.quick-nav a').forEach(link => {
    if (link.dataset.room === next) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  ledger.innerHTML = `<p><span class="ledger-dot" aria-hidden="true"></span>${room.hint}</p><div class="ledger-links">${room.staff.map(id => `<button data-staff="${id}">Talk to ${staff[id].name}</button>`).join('')}${next === 'entrance' ? '<a href="https://discord.gg/VkAFZHyUn">Join our Discord ↗</a>' : ''}</div>`;
  document.querySelector('#wayfinding').textContent = next === 'entrance' ? 'Choose a doorway. Follow your curiosity.' : 'We’ll remember where you were working.';
  document.title = next === 'entrance' ? 'Ember Studio — The Living Studio' : `${room.title} — Ember Studio`;
  remember('ember-room', next);
  sound.setRoom(next);
  motionButton.hidden = next !== 'entrance';
  localize();
  if (focus) { document.querySelector('#room-title').setAttribute('tabindex', '-1'); document.querySelector('#room-title').focus({ preventScroll: true }); sound.effect('door'); }
}
async function openConversation(id) {
  const person = staff[id];
  if (!person) return;
  const request = ++conversationRequest;
  const portraitSource = `assets/characters/${id}-portrait.webp`;
  const portraitImage = new Image();
  portraitImage.src = portraitSource;
  try { await portraitImage.decode(); } catch { /* The dialogue can still show its text if an image fails. */ }
  if (request !== conversationRequest) return;
  staffOpener = document.activeElement;
  document.querySelector('#staff-portrait').src = portraitSource;
  document.querySelector('#staff-portrait').alt = `${person.name}, ${person.role}`;
  document.querySelector('#staff-role').textContent = person.role;
  document.querySelector('#staff-name').textContent = person.name;
  document.querySelector('#staff-line').textContent = person.greeting;
  const options = document.querySelector('#staff-options');
  options.replaceChildren();
  const work = document.createElement('button');
  work.className = 'control'; work.textContent = 'What are you working on?';
  work.addEventListener('click', () => { document.querySelector('#staff-line').textContent = person.detail; localize(staffDialog); sound.effect('talk'); });
  options.append(work);
  if (id === 'jenny') { const community = document.createElement('a'); community.className = 'control'; community.href = destinations[0][2]; community.textContent = 'Join the conversation ↗'; options.append(community); }
  staffDialog.showModal();
  localize(staffDialog);
  document.querySelector('[data-close-dialog]').focus();
  sound.effect('talk');
}
document.querySelector('[data-close-dialog]').addEventListener('click', () => staffDialog.close());
staffDialog.addEventListener('close', () => { if (!document.querySelector('#book-dialog').open && staffOpener?.isConnected) staffOpener.focus({ preventScroll: true }); });
const traces = { pixels: 'Pixie leaves three tiny colour studies in the margin.', build: 'Mora’s instrument settles into a clean, repeating pattern.', test: 'Star marks one more case checked. Then adds another.' };
function interact(event) {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.staff) openConversation(target.dataset.staff);
  if (target.dataset.book) { target.classList.add('selected'); reader.open(target.dataset.book); }
  if (target.classList.contains('rune-control')) {
    target.classList.add('active'); sound.effect('rune'); showNotice('For a moment, the scattered lines remember their shape.');
    setTimeout(() => target.classList.remove('active'), 1800);
  }
  if (target.dataset.tool) {
    target.querySelector('.tool-marks')?.remove();
    target.insertAdjacentHTML('beforeend', '<span class="tool-marks" aria-hidden="true"><i></i><i></i><i></i></span>');
    sound.effect('tool'); showNotice(traces[target.dataset.tool]);
  }
}
foreground.addEventListener('click', interact);
ledger.addEventListener('click', interact);
document.querySelector('#book-dialog').addEventListener('close', () => {
  sound.setReading(false);
  foreground.querySelectorAll('.selected').forEach(book => book.classList.remove('selected'));
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
mobile.addEventListener('change', updateArt);
document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-hidden', document.hidden));
document.addEventListener('click', event => {
  if (event.target.closest('[data-language]')) { reader.stopTurn(); setLanguage(getLanguage() === 'en' ? 'ko' : 'en'); }
});
const weather = document.querySelector('.scene-weather');
weather.innerHTML = '<div class="aurora-veil"></div><div class="hearth-glow"></div>' + Array.from({ length: 28 }, (_, index) => '<i class="snowflake" style="--left:' + ((index * 37) % 110) + '%;--cycle:' + (10 + index % 13) + 's;--delay:-' + (index * 1.7) + 's;--size:' + (index % 3 + 1) + 'px"></i>').join('');
const motionButton = document.querySelector('#motion-toggle');
let motionOptIn = saved('ember-motion-paused') === 'false';
let motionPaused = saved('ember-motion-paused') === null ? reduced.matches : saved('ember-motion-paused') === 'true';
function updateMotion() {
  scene.classList.toggle('motion-paused', motionPaused);
  scene.classList.toggle('motion-opt-in', !motionPaused && motionOptIn);
  motionButton.textContent = motionPaused ? 'Play animation' : 'Pause animation';
  motionButton.setAttribute('aria-pressed', String(motionPaused));
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
