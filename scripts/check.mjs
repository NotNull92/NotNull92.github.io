import { translate } from '../assets/locale.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../assets/project-records.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const app = read('assets/college.js');
const rooms = ['entrance', 'hall', 'library', 'workshop', 'doors'];
const social = ['https://discord.gg/VkAFZHyUn', 'https://www.youtube.com/@emberstudioo', 'https://www.threads.com/@emberstudio26', 'https://github.com/NotNull92'];
for (const name of ['index.html', 'works.html', 'college.html']) {
  const html = read(name);
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1, `${name}: one H1`);
  assert(html.includes('lang="en"'), `${name}: language`);
  for (const url of social) assert((name === 'index.html' ? app : html).includes(url), `${name}: ${url}`);
  for (const [, value] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [file, fragment] = value.split('#');
    const target = file === './' ? 'index.html' : file || name;
    assert(fs.existsSync(path.join(root, target)), `${name}: missing ${target}`);
    if (fragment) assert(read(target).includes(`id="${fragment}"`) || (target === 'index.html' && rooms.includes(fragment)), `${name}: missing #${fragment}`);
  }
}
assert(read('index.html').includes('type="module" src="assets/college.js"'));
assert(read('index.html').includes('Games that glow<br>after the screen fades.'));
assert(read('index.html').includes('Ember Studio — The Living Studio'));
assert(app.includes("title: 'The Project Archive'"));
assert(app.includes("title: 'The Development Workshop'"));
for (const stale of ['The Living College', 'Enter the college', 'A COLLEGE OF CURIOUS MAKERS', 'ambitious spell']) {
  assert(!read('index.html').includes(stale) && !app.includes(stale), 'Removed school-as-organization copy: ' + stale);
}
for (const room of rooms) assert(fs.existsSync(path.join(root, `assets/scenes/${room}.webp`)), `${room}: scenery`);
for (const id of ['julie', 'mora', 'bara', 'star', 'jenny', 'pixie']) {
  for (const type of ['sprite', 'portrait']) assert(fs.existsSync(path.join(root, `assets/characters/${id}-${type}.webp`)), `${id}: ${type}`);
  assert(app.includes(`${id}: {`), `${id}: conversation`);
}
for (const [, file] of read('assets/college.css').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) assert(fs.existsSync(path.join(root, 'assets', file)), `CSS missing ${file}`);
const css = read('assets/college.css');
assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, 'Balanced CSS blocks');
assert(!/;grid\s*\n/.test(css), 'No truncated grid declaration');
assert.deepEqual(projects.map(p => p.title), ['Golem Sculptor', 'Monstel']);
for (const project of projects) {
  assert.equal(project.pages.length, 6);
  assert(project.pages.at(-1).body.join(' ').includes('in development'));
  for (const page of project.pages) for (const link of page.links ?? []) assert(social.includes(link.href), 'Approved project destination');
}
const college = read('college.html');
for (const name of ['Julie', 'Mora', 'Bara', 'Star', 'Jenny', 'Pixie']) assert(college.includes(`<h3>${name}</h3>`));
assert(!/Mephala|메피/.test(college));
console.log('PASS: entry routes, assets, room anchors, exact social URLs, six staff and twelve project pages.');

for (const project of projects) {
  for (const page of project.pages) {
    for (const text of [page.title, page.section, ...page.body, page.note, ...(page.links ?? []).map(link => link.label)]) {
      assert.equal(translate(text), text, 'English is the default');
      assert.notEqual(translate(text, 'ko'), text, 'Missing Korean: ' + text);
    }
  }
}
assert.equal(translate('  Pages 3–4 of 6  ', 'ko'), '  전체 6쪽 중 3–4쪽  ');
assert.equal(translate('Talk to Julie', 'ko'), '줄리와 이야기하기');
assert.equal(translate('Open Golem Sculptor project record', 'ko'), '골렘 조각사 프로젝트 기록 열기');
assert.equal(translate('PROJECT 01', 'ko'), '프로젝트 01');
assert.equal(translate('Ember Studio Archive · Project 01', 'ko'), '엠버 스튜디오 기록실 · 프로젝트 01');
assert.equal(translate('A future proper name', 'ko'), 'A future proper name');
console.log('PASS: Korean covers every book page and dynamic reader labels; English default preserved.');
