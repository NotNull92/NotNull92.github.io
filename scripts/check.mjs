import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const social = ['https://discord.gg/VkAFZHyUn', 'https://www.youtube.com/@emberstudioo', 'https://www.threads.com/@emberstudio26', 'https://github.com/NotNull92'];
for (const name of ['index.html', 'works.html', 'college.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1, `${name}: one H1`);
  assert(html.includes('lang="en"'), `${name}: language`);
  for (const url of social) assert(html.includes(`href="${url}"`), `${name}: ${url}`);
  for (const [, value] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [file, fragment] = value.split('#');
    const target = file === './' ? 'index.html' : file || name;
    assert(fs.existsSync(path.join(root, target)), `${name}: missing ${target}`);
    if (fragment) {
      const targetHtml = fs.readFileSync(path.join(root, target), 'utf8');
      assert(targetHtml.includes(`id="${fragment}"`), `${name}: missing #${fragment}`);
    }
  }
  assert(!/<script\b/.test(html), `${name}: no runtime JavaScript`);
}
const works = fs.readFileSync(path.join(root, 'works.html'), 'utf8');
assert.equal((works.match(/In development/g) || []).length, 2);
for (const title of ['Golem Sculptor', 'Monstel']) assert(works.includes(`<h2>${title}</h2>`));
const college = fs.readFileSync(path.join(root, 'college.html'), 'utf8');
for (const name of ['Julie', 'Mora', 'Bara', 'Star', 'Jenny', 'Pixie']) assert(college.includes(`<h3>${name}</h3>`));
assert(!/Mephala|메피/.test(college));
console.log('PASS: three pages, assets, local anchors, exact social URLs, works and staff.');
