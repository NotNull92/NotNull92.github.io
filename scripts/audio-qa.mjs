import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const origin = 'http://127.0.0.1:4173';
const evidence = join(process.cwd(), '.omo', 'evidence', 'audio-restore');
const profile = join(tmpdir(), `ember-audio-${Date.now()}`);
const port = 9334;
const files = [
  '8bit_palace_edit_76s.wav',
  '8bit_library_edit_90s.wav',
  '8bit_magicSchool_edit_60s.wav',
  '8bit_nightsea_edit_82s.wav'
];

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
  const consoleLines = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
    if (message.method === 'Runtime.consoleAPICalled') {
      const text = (message.params.args || []).map(arg => arg.value ?? arg.description ?? '').join(' ');
      consoleLines.push({ type: message.params.type, text });
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++next;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
  return { ws, send, consoleLines };
}

const chrome = spawn(chromePath, [
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--autoplay-policy=no-user-gesture-required',
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

const { ws, send, consoleLines } = await connect();
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  await call('Page.navigate', { url: `${origin}/#hall` });
  await wait(1000);

  const http = {};
  for (const name of files) {
    http[name] = await call('Runtime.evaluate', {
      expression: `fetch(${JSON.stringify('/assets/audio/' + name)}).then(async r => ({ ok: r.ok, status: r.status, bytes: (await r.arrayBuffer()).byteLength }))`,
      awaitPromise: true,
      returnByValue: true
    }).then(r => r.result.value);
  }

  await call('Runtime.evaluate', { expression: `document.querySelector('#sound-toggle').click()`, userGesture: true });
  await wait(1500);

  const ui = await call('Runtime.evaluate', {
    expression: `({
      pressed: document.querySelector('#sound-toggle').getAttribute('aria-pressed'),
      label: document.querySelector('#sound-toggle span')?.textContent,
      notice: document.querySelector('#notice').textContent,
      room: document.querySelector('#scene').dataset.room
    })`,
    returnByValue: true
  }).then(r => r.result.value);

  const rooms = {};
  for (const room of ['hall', 'library', 'workshop', 'doors', 'entrance', 'library']) {
    await call('Runtime.evaluate', { expression: `location.hash=${JSON.stringify('#' + room)}` });
    await wait(350);
    rooms[room] = await call('Runtime.evaluate', {
      expression: `({ hash: location.hash, room: document.querySelector('#scene').dataset.room, notice: document.querySelector('#notice').textContent })`,
      returnByValue: true
    }).then(r => r.result.value);
  }

  await call('Runtime.evaluate', { expression: `document.querySelector('[data-book=golem]')?.click()`, userGesture: true });
  await wait(500);
  const reading = await call('Runtime.evaluate', {
    expression: `({ book: document.querySelector('#book-dialog')?.open, pressed: document.querySelector('#sound-toggle').getAttribute('aria-pressed') })`,
    returnByValue: true
  }).then(r => r.result.value);

  await call('Runtime.evaluate', { expression: `document.querySelector('#book-dialog')?.close()` });
  await wait(200);
  await call('Runtime.evaluate', { expression: `document.querySelector('#sound-toggle').click()`, userGesture: true });
  await wait(200);
  const muted = await call('Runtime.evaluate', {
    expression: `document.querySelector('#sound-toggle').getAttribute('aria-pressed')`,
    returnByValue: true
  }).then(r => r.result.value);

  const report = {
    http,
    ui,
    rooms,
    reading,
    muted,
    warnings: consoleLines.filter(line => line.type === 'warning' || /Could not load/.test(line.text))
  };
  await writeFile(join(evidence, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  const missing = files.filter(name => !http[name]?.ok);
  if (missing.length || ui.pressed !== 'true' || muted !== 'false' || report.warnings.length) {
    process.exitCode = 1;
  }
} finally {
  ws.close();
  chrome.kill();
}
