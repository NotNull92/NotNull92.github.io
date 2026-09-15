import assert from 'node:assert/strict';
import { BookReader, readingIndex } from '../assets/book.js';
import { projects } from '../assets/project-records.js';

for (const project of projects) {
  const count = project.pages.length;
  assert.equal(readingIndex(-3, count), 0);
  assert.equal(readingIndex(count + 8, count), count - 1);
  for (const invalid of [NaN, Infinity, 1.5, undefined, '2']) assert.equal(readingIndex(invalid, count), 0);
  for (let index = 0; index < count; index++) assert.equal(readingIndex(index, count), index);
  for (const pageWidth of [1, 2]) {
    const reader = {
      project,
      dialog: { open: true },
      pageWidth,
      index: 0,
      goTo(target) { this.index = readingIndex(target, count); }
    };
    const visited = new Set();
    for (let turn = 0; turn < count + 1; turn++) {
      for (let page = reader.index; page < Math.min(count, reader.index + pageWidth); page++) visited.add(page);
      BookReader.prototype.step.call(reader, 1);
    }
    assert.equal(visited.size, count, `${project.id}: every page must be reachable at width ${pageWidth}`);
    const last = reader.index;
    BookReader.prototype.step.call(reader, 1);
    assert.equal(reader.index, last, 'Next stays on the last spread');
    for (let turn = 0; turn < count; turn++) BookReader.prototype.step.call(reader, -1);
    assert.equal(reader.index, 0, 'Previous returns to the first page');
    reader.index = 3;
    reader.dialog.open = false;
    BookReader.prototype.step.call(reader, 1);
    assert.equal(reader.index, 3, 'Closed readers ignore page keys');
  }
  for (const section of ['Game overview', 'Development notes']) assert.ok(project.pages.some(page => page.section === section));
  for (const page of project.pages) {
    const words = page.body.join(' ').split(/\s+/).length;
    assert.ok(words >= 30 && words <= 70, `${project.id}/${page.title}: ${words} body words`);
  }
}
console.log('Book checks passed: every leaf reachable, exact indices preserved, boundaries and content fit.');
