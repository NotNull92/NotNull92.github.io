import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const origin = 'http://127.0.0.1:8765';
const evidence = join(process.cwd(), '.omo', 'evidence', 'motion-review');
const profile = join(tmpdir(), `ember-review-${Date.now()}`);
const port = 9335;

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

async function evalJson(call, expression) {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'evaluate failed');
  return result.result.value;
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
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await call('Emulation.setDeviceMetricsOverride', { width: 768, height: 900, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: `${origin}/#library` });
  await wait(900);
  await evalJson(call, `localStorage.setItem('ember-motion-paused','false'); localStorage.setItem('ember-language','en'); location.hash='#library'; location.reload();`);
  await wait(1100);
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await evalJson(call, `if (document.documentElement.classList.contains('motion-paused')) document.querySelector('#motion-toggle').click();`);

  await evalJson(call, `location.hash='#hall'`);
  await wait(500);
  await evalJson(call, `location.hash='#library'`);
  await call('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await wait(1100);
  const fade = await evalJson(call, `(() => {
    const layer = document.querySelector('#scene-art-fade');
    const art = document.querySelector('#scene-art');
    return {
      room: document.querySelector('#scene').dataset.room,
      art: art.getAttribute('data-scene'),
      fading: layer.classList.contains('is-fading'),
      fadeSrc: layer.getAttribute('src') || '',
      opacity: getComputedStyle(layer).opacity
    };
  })()`);

  await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 860, deviceScaleFactor: 1, mobile: false });
  await evalJson(call, `location.hash='#workshop'`);
  await wait(400);
  await evalJson(call, `document.querySelector('[data-tool=build]').click(); document.querySelector('[data-tool=test]').click();`);
  await wait(1100);
  const tools = await evalJson(call, `({
    leftover: document.querySelectorAll('.tool-fx').length,
    build: document.querySelectorAll('.tool-build').length,
    test: document.querySelectorAll('.tool-test').length
  })`);

  if (!await evalJson(call, `document.documentElement.classList.contains('motion-paused')`)) {
    await evalJson(call, `document.querySelector('#motion-toggle').click();`);
  }
  await wait(150);
  await evalJson(call, `location.hash='#hall'`);
  await wait(300);
  await evalJson(call, `document.querySelector('[data-staff=julie]').click();`);
  await wait(250);
  const pausedDialog = await evalJson(call, `({
    paused: document.documentElement.classList.contains('motion-paused'),
    open: document.querySelector('#staff-dialog').open,
    animation: getComputedStyle(document.querySelector('#staff-dialog')).animationName
  })`);
  await evalJson(call, `document.querySelector('#staff-dialog').close();`);
  await wait(150);
  await evalJson(call, `location.hash='#library'`);
  await wait(300);
  await evalJson(call, `document.querySelector('[data-book=golem]').click();`);
  await wait(300);
  const pausedBook = await evalJson(call, `({
    open: document.querySelector('#book-dialog').open,
    animation: getComputedStyle(document.querySelector('.book-spread')).animationName
  })`);
  await evalJson(call, `document.querySelector('#book-dialog').close();`);
  await wait(150);

  async function hover(selector) {
    const point = await evalJson(call, `(() => {
      const box = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    })()`);
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
    await wait(80);
  }

  await evalJson(call, `location.hash='#library'`);
  await wait(350);
  const ribbonRest = await evalJson(call, `(() => {
    const style = getComputedStyle(document.querySelector('.book-ribbon'));
    return { transition: style.transitionDuration, transform: style.transform };
  })()`);
  await hover('.volume');
  const ribbonHover = await evalJson(call, `(() => {
    const volume = document.querySelector('.volume');
    const ribbon = getComputedStyle(document.querySelector('.book-ribbon'));
    const cover = getComputedStyle(document.querySelector('.volume-cover'));
    return {
      hovered: volume.matches(':hover'),
      ribbonTransition: ribbon.transitionDuration,
      ribbonTransform: ribbon.transform,
      coverTransform: cover.transform
    };
  })()`);
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 8, y: 8 });
  await wait(280);
  const ribbonBlur = await evalJson(call, `(() => {
    const ribbon = getComputedStyle(document.querySelector('.book-ribbon'));
    const cover = getComputedStyle(document.querySelector('.volume-cover'));
    return { ribbonTransform: ribbon.transform, coverTransform: cover.transform, ribbonTransition: ribbon.transitionDuration };
  })()`);
  await evalJson(call, `document.querySelector('[data-tool=pixels]').click();`);
  await wait(80);
  const notice = await evalJson(call, `(() => {
    const node = document.querySelector('#notice');
    const style = getComputedStyle(node);
    const matrix = new DOMMatrix(style.transform);
    return {
      visible: node.classList.contains('visible'),
      text: node.textContent,
      transition: style.transitionDuration,
      x: matrix.e,
      y: matrix.f
    };
  })()`);

  await evalJson(call, `location.hash='#hall'`);
  await wait(350);
  await hover('.actor');
  const talk = await evalJson(call, `(() => {
    const symbol = getComputedStyle(document.querySelector('.talk-symbol'));
    const matrix = new DOMMatrix(symbol.transform);
    return {
      hovered: document.querySelector('.actor').matches(':hover'),
      opacity: Number(symbol.opacity),
      transition: symbol.transitionDuration,
      y: matrix.f
    };
  })()`);
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 8, y: 8 });
  await wait(200);
  const talkBlur = await evalJson(call, `(() => {
    const symbol = getComputedStyle(document.querySelector('.talk-symbol'));
    return { opacity: Number(symbol.opacity), y: new DOMMatrix(symbol.transform).f, transition: symbol.transitionDuration };
  })()`);

  await evalJson(call, `document.querySelector('#motion-toggle').click();`);
  await wait(150);
  await evalJson(call, `location.hash='#library'`);
  await wait(350);
  const playRibbonRest = await evalJson(call, `getComputedStyle(document.querySelector('.book-ribbon')).transitionDuration`);
  await hover('.volume');
  const playRibbonHover = await evalJson(call, `({
    hovered: document.querySelector('.volume').matches(':hover'),
    y: new DOMMatrix(getComputedStyle(document.querySelector('.book-ribbon')).transform).f,
    transition: getComputedStyle(document.querySelector('.book-ribbon')).transitionDuration
  })`);

  await evalJson(call, `location.hash='#entrance'`);
  await wait(400);
  const hearth = await evalJson(call, `(() => {
    const button = document.querySelector('.primary-action');
    button.focus();
    const glow = document.querySelector('.hearth-glow');
    const style = getComputedStyle(glow);
    return {
      focus: document.activeElement === button,
      matches: document.querySelector('#scene').matches(':has(.primary-action:focus-visible), :has(.primary-action:focus)'),
      animation: style.animationName,
      opacity: Number(style.opacity)
    };
  })()`);

  const report = { fade, tools, pausedDialog, pausedBook, ribbonRest, ribbonHover, ribbonBlur, notice, talk, talkBlur, playRibbonRest, playRibbonHover, hearth };
  await writeFile(join(evidence, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  const zeroTime = value => String(value).split(',').every(part => Number.parseFloat(part) === 0);
  const failed = [];
  if (fade.room !== 'library' || fade.art !== 'assets/scenes/library.webp' || fade.fading || Number(fade.opacity) > 0.05) failed.push('fade');
  if (tools.leftover !== 0) failed.push('tools');
  if (!pausedDialog.paused || pausedDialog.animation !== 'none') failed.push('dialog');
  if (pausedBook.animation !== 'none') failed.push('book');
  if (!zeroTime(ribbonRest.transition) || ribbonRest.transform !== 'none') failed.push('ribbon-rest');
  if (!ribbonHover.hovered || !zeroTime(ribbonHover.ribbonTransition) || ribbonHover.ribbonTransform !== 'none') failed.push('ribbon-hover');
  if (ribbonBlur.ribbonTransform !== 'none' || !zeroTime(ribbonBlur.ribbonTransition)) failed.push('ribbon-blur');
  if (!notice.visible || !zeroTime(notice.transition) || Math.abs(notice.y) > 0.5) failed.push('notice');
  if (!talk.hovered || talk.opacity < 0.9 || Math.abs(talk.y) > 0.5 || !zeroTime(talk.transition)) failed.push('talk');
  if (talkBlur.opacity > 0.05 || Math.abs(talkBlur.y) > 0.5) failed.push('talk-blur');
  if (zeroTime(playRibbonRest)) failed.push('play-ribbon-rest');
  if (!playRibbonHover.hovered || playRibbonHover.y > -20) failed.push('play-ribbon-hover');
  if (hearth.animation !== 'none' || hearth.opacity < 0.9) failed.push('hearth');
  if (failed.length) {
    console.error('FAIL:', failed.join(', '));
    process.exitCode = 1;
  } else {
    console.log('PASS: review repros including paused ribbon/notice/talk and Play restore.');
  }
} finally {
  ws.close();
  chrome.kill();
}
