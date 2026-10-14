import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const origin = 'http://127.0.0.1:4173';
const evidence = join(process.cwd(), '.omo', 'evidence', 'motion-juice');
const profile = join(tmpdir(), `ember-qa-${Date.now()}`);
const port = 9333;

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function connect() {
  const version = await fetch(`http://127.0.0.1:${port}/json/version`).then(r => r.json());
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let next = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++next;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
  return { ws, send };
}

async function attach(send, url) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Page.navigate', { url });
  await wait(900);
  return call;
}

async function evalJson(call, expression) {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'evaluate failed');
  return result.result.value;
}

async function shot(call, name) {
  const { data } = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(join(evidence, `${name}.png`), Buffer.from(data, 'base64'));
}

async function viewport(call, width, height, mobile = false) {
  await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await wait(250);
}

const chrome = spawn(chromePath, [
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
], { stdio: 'ignore' });

await mkdir(evidence, { recursive: true });
let ready = false;
for (let i = 0; i < 40; i++) {
  try { await fetch(`http://127.0.0.1:${port}/json/version`); ready = true; break; } catch { await wait(150); }
}
if (!ready) {
  chrome.kill();
  throw new Error('Chrome DevTools did not start');
}

const { ws, send } = await connect();
const report = { viewport: {}, rooms: {}, interactions: {}, limits: [] };

try {
  const call = await attach(send, `${origin}/#entrance`);
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await evalJson(call, `localStorage.clear(); location.hash='#entrance'; location.reload();`);
  await wait(1100);
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await wait(200);
  await evalJson(call, `if (document.documentElement.classList.contains('motion-paused')) document.querySelector('#motion-toggle').click();`);
  await wait(150);

  for (const [name, width, height, isMobile] of [['desktop', 1280, 860, false], ['tablet', 768, 900, false], ['mobile', 375, 812, true]]) {
    await viewport(call, width, height, isMobile);
    const rooms = {};
    for (const room of ['entrance', 'hall', 'library', 'workshop', 'doors']) {
      await evalJson(call, `location.hash=${JSON.stringify('#' + room)}`);
      await wait(500);
      const state = await evalJson(call, `({
        hash: location.hash,
        room: document.querySelector('#scene').dataset.room,
        title: document.querySelector('#room-title')?.textContent.trim(),
        motion: document.querySelector('#motion-toggle')?.offsetParent !== null,
        fade: document.querySelectorAll('.scene-art-fade.is-fading').length,
        glow: document.querySelectorAll('.candle-glow').length,
        dust: document.querySelectorAll('.dust').length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      })`);
      rooms[room] = state;
      await shot(call, `${name}-${room}`);
    }
    report.viewport[name] = rooms;
  }

  await viewport(call, 1280, 860, false);
  await evalJson(call, `location.hash='#hall'`);
  await wait(400);
  await evalJson(call, `document.querySelector('.rune-control').click();`);
  await wait(420);
  report.interactions.rune = await evalJson(call, `({
    active: document.querySelector('.rune-control').classList.contains('active'),
    sparks: document.querySelectorAll('.rune-spark i').length,
    wave: !!document.querySelector('.rune-wave'),
    notice: document.querySelector('#notice').textContent
  })`);
  await shot(call, 'desktop-rune');
  for (let i = 0; i < 9; i++) await evalJson(call, `document.querySelector('.rune-control').click();`);
  await wait(200);
  report.interactions.runeRepeat = await evalJson(call, `({
    active: document.querySelector('.rune-control').classList.contains('active'),
    sparks: document.querySelectorAll('.rune-spark').length,
    noticeVisible: document.querySelector('#notice').classList.contains('visible')
  })`);

  await evalJson(call, `location.hash='#workshop'`);
  await wait(400);
  await evalJson(call, `document.querySelector('[data-tool=build]').click();`);
  await wait(280);
  report.interactions.build = await evalJson(call, `document.querySelectorAll('.tool-build i').length`);
  await shot(call, 'desktop-build');
  await evalJson(call, `document.querySelector('[data-tool=test]').click();`);
  await wait(280);
  report.interactions.test = await evalJson(call, `({
    checks: document.querySelectorAll('.tool-test').length,
    leftoverBuild: document.querySelectorAll('.tool-build').length,
    notice: document.querySelector('#notice').textContent
  })`);
  await shot(call, 'desktop-test');
  await evalJson(call, `location.hash='#library'`);
  await wait(350);
  report.interactions.leftWorkshop = await evalJson(call, `({
    tools: document.querySelectorAll('.tool-fx').length,
    notice: document.querySelector('#notice').textContent,
    room: document.querySelector('#scene').dataset.room
  })`);
  await evalJson(call, `document.querySelector('[data-tool=pixels]').click();`);
  await wait(280);
  report.interactions.pixels = await evalJson(call, `document.querySelectorAll('.tool-pixels i').length`);
  await shot(call, 'desktop-pixels');

  const last = await evalJson(call, `(async () => {
    const order = ['hall','library','workshop','doors','entrance','workshop','library'];
    for (const room of order) location.hash = '#' + room;
    await new Promise(r => setTimeout(r, 700));
    return {
      hash: location.hash,
      room: document.querySelector('#scene').dataset.room,
      fading: document.querySelectorAll('.scene-art-fade.is-fading').length,
      title: document.querySelector('#room-title')?.textContent.trim()
    };
  })()`);
  report.interactions.rapidNav = last;
  await shot(call, 'desktop-rapid-library');

  await evalJson(call, `document.querySelector('[data-book=golem]').click();`);
  await wait(500);
  report.interactions.book = await evalJson(call, `({
    open: document.querySelector('#book-dialog').open,
    modal: document.documentElement.classList.contains('modal-open'),
    envPaused: getComputedStyle(document.querySelector('.dust') || document.body).animationPlayState,
    page: document.querySelector('.page-progress')?.textContent
  })`);
  await shot(call, 'desktop-book');
  await evalJson(call, `document.querySelector('#book-dialog .page-nav .control:last-child').click();`);
  await wait(200);
  report.interactions.bookTurn = await evalJson(call, `({
    page: document.querySelector('.page-progress')?.textContent,
    leaves: document.querySelectorAll('.turning-leaf').length
  })`);
  await evalJson(call, `document.querySelector('#book-dialog').close();`);
  await wait(200);

  await evalJson(call, `location.hash='#hall'`);
  await wait(350);
  await evalJson(call, `document.querySelector('[data-staff=julie]').click();`);
  await wait(400);
  report.interactions.julie = await evalJson(call, `({
    open: document.querySelector('#staff-dialog').open,
    name: document.querySelector('#staff-name')?.textContent,
    selected: document.querySelector('.actor.selected')?.dataset.staff,
    line: document.querySelector('#staff-line')?.textContent.slice(0, 40)
  })`);
  await shot(call, 'desktop-julie');
  await evalJson(call, `document.querySelector('#staff-options .control').click();`);
  await wait(120);
  report.interactions.julieDetail = await evalJson(call, `document.querySelector('#staff-line')?.textContent.slice(0, 50)`);
  await evalJson(call, `document.querySelector('[data-close-dialog]').click();`);
  await wait(200);

  await evalJson(call, `location.hash='#hall'`);
  await wait(300);
  const beforePause = await evalJson(call, `document.documentElement.classList.contains('motion-paused')`);
  if (!beforePause) await evalJson(call, `document.querySelector('#motion-toggle').click();`);
  await wait(150);
  report.interactions.paused = await evalJson(call, `(() => {
    document.querySelector('.rune-control').click();
    return {
      pressed: document.querySelector('#motion-toggle').getAttribute('aria-pressed'),
      html: document.documentElement.classList.contains('motion-paused'),
      sparks: document.querySelectorAll('.rune-spark').length,
      active: document.querySelector('.rune-control').classList.contains('active'),
      notice: document.querySelector('#notice').classList.contains('visible')
    };
  })()`);
  await shot(call, 'desktop-paused-rune');
  await evalJson(call, `document.querySelector('#motion-toggle').click();`);
  await wait(200);
  report.interactions.played = await evalJson(call, `(() => {
    document.querySelector('.rune-control').click();
    return {
      paused: document.documentElement.classList.contains('motion-paused'),
      sparks: document.querySelectorAll('.rune-spark i').length,
      wave: !!document.querySelector('.rune-wave')
    };
  })()`);
  await wait(400);
  await shot(call, 'desktop-played-rune');

  await evalJson(call, `document.querySelector('[data-language]').click();`);
  await wait(250);
  report.interactions.korean = await evalJson(call, `({
    lang: document.documentElement.lang,
    hall: document.querySelector('#room-title')?.textContent,
    motion: document.querySelector('#motion-toggle span')?.textContent,
    pauseLabel: document.querySelector('#motion-toggle')?.title
  })`);
  await shot(call, 'desktop-korean-hall');
  await evalJson(call, `location.hash='#doors'`);
  await wait(400);
  await shot(call, 'desktop-korean-doors');
  await evalJson(call, `document.querySelector('[data-language]').click();`);

  await viewport(call, 375, 812, true);
  await evalJson(call, `location.hash='#entrance'`);
  await wait(400);
  report.interactions.mobileMotion = await evalJson(call, `({
    motionVisible: document.querySelector('#motion-toggle')?.getBoundingClientRect().height > 0,
    headerOverlap: document.querySelector('#motion-toggle').getBoundingClientRect().bottom <= document.querySelector('.world-header').getBoundingClientRect().bottom + 1,
    doorHidden: getComputedStyle(document.querySelector('.entrance-door')).display === 'none'
  })`);
  await shot(call, 'mobile-entrance-controls');

  await evalJson(call, `location.hash='#workshop'`);
  await wait(300);
  await evalJson(call, `document.querySelector('[data-tool=build]').click(); location.hash='#doors';`);
  await wait(500);
  report.interactions.toolThenLeave = await evalJson(call, `({
    room: document.querySelector('#scene').dataset.room,
    tools: document.querySelectorAll('.tool-fx').length,
    notice: document.querySelector('#notice').textContent
  })`);

  await writeFile(join(evidence, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  ws.close();
  chrome.kill();
}
