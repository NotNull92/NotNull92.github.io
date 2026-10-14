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
// Exercise the real turn path: reuse the outgoing page and never wait to show content.
const previousDocument = globalThis.document;
try {
  for (const { wide, from, to, allowed, hidden } of [
    { wide: true, from: 0, to: 2, allowed: true, hidden: false },
    { wide: true, from: 4, to: 2, allowed: true, hidden: false },
    { wide: false, from: 0, to: 1, allowed: true, hidden: false },
    { wide: false, from: 2, to: 1, allowed: true, hidden: false },
    { wide: true, from: 0, to: 2, allowed: false, hidden: false },
    { wide: true, from: 0, to: 2, allowed: true, hidden: true }
  ]) {
    globalThis.document = { hidden };
    const events = [];
    let finish;
    let removed = 0;
    let frames;
    let options;
    const scroll = { scrollTop: from === 0 ? 120 : 0 };
    const originalScrollTop = scroll.scrollTop;
    const animation = {
      finished: new Promise(resolve => { finish = resolve; }),
      cancel() { events.push('cancel'); }
    };
    const leaf = {
      style: {}, classList: { add() {} }, setAttribute() {},
      querySelector() { return scroll; },
      remove() { removed++; },
      animate(keyframes, settings) {
        events.push('animate'); frames = keyframes; options = settings;
        return animation;
      }
    };
    const reader = {
      project: projects[0], index: from, wide: { matches: wide }, turn: null,
      canTurn: () => allowed,
      spread: {
        querySelector(selector) {
          assert.equal(selector, to > from && wide ? '.right-page' : '.left-page');
          return leaf;
        },
        append(node) { assert.equal(node, leaf, 'reuse the outgoing node, do not clone it'); }
      },
      render() { assert.equal(this.index, to); scroll.scrollTop = 0; events.push('render'); },
      onEffect() { events.push('effect'); },
      stopTurn: BookReader.prototype.stopTurn
    };
    BookReader.prototype.goTo.call(reader, to);
    assert.deepEqual(events.slice(0, 2), ['render', 'effect']);
    if (!allowed || hidden) {
      assert.equal(reader.turn, null);
      assert.equal(frames, undefined, 'paused/hidden readers render without a decorative turn');
      continue;
    }
    assert.equal(reader.turn.leaf, leaf);
    assert.equal(scroll.scrollTop, originalScrollTop, 'the outgoing leaf must retain its reading position');
    assert.equal(leaf.inert, true);
    assert.equal(leaf.style.width, wide ? '50%' : '100%');
    assert.equal(leaf.style.transformOrigin, to > from ? 'left center' : 'right center');
    for (const frame of frames) {
      assert.deepEqual(Object.keys(frame).sort(), ['opacity', 'transform']);
      assert.ok(!frame.transform.includes('perspective'), 'the spread already supplies perspective');
    }
    assert.equal(options.duration, 320);
    finish();
    await animation.finished;
    assert.equal(reader.turn, null);
    assert.equal(removed, 1, 'finished turns remove only the decorative page');
  }
} finally {
  if (previousDocument === undefined) delete globalThis.document;
  else globalThis.document = previousDocument;
}
console.log('Book checks passed: page reachability, indices, lightweight turns, pause and cleanup.');
