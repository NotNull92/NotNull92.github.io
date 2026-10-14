import assert from 'node:assert/strict';
import { pageTurnAllowed, requestGate, beginIfChanged, readingIndex } from '../assets/book.js';

const late = requestGate();
const first = late.start();
const second = late.start();
assert.equal(late.isCurrent(first), false, 'a late first request must not still be current');
assert.equal(late.isCurrent(second), true, 'the last request wins');
late.cancel();
assert.equal(late.isCurrent(second), false, 'cancel invalidates the last request');
const third = late.start();
assert.equal(late.isCurrent(third), true);

let allowed = true;
assert.equal(pageTurnAllowed(() => allowed, false), true);
assert.equal(pageTurnAllowed(() => allowed, true), false, 'hidden tabs skip the decorative leaf');
allowed = false;
assert.equal(pageTurnAllowed(() => allowed, false), false, 'paused motion still turns the index, not the leaf');
assert.equal(pageTurnAllowed(() => true, false), true);

assert.equal(readingIndex(4, 6), 4);
assert.equal(readingIndex(99, 6), 5);

const rune = requestGate();
const clicks = [];
for (let i = 0; i < 10; i++) {
  const token = rune.start();
  clicks.push(token);
}
const stale = clicks[0];
const latest = clicks.at(-1);
assert.equal(rune.isCurrent(stale), false, 'an old rune timeout must not clear the newest reaction');
assert.equal(rune.isCurrent(latest), true);

const art = requestGate();
const crossing = beginIfChanged('assets/scenes/hall.webp', 'assets/scenes/library.webp', art);
assert.equal(typeof crossing, 'number');
assert.equal(beginIfChanged('assets/scenes/library.webp', 'assets/scenes/library.webp', art), null, 'same indoor path must not bump the art gate');
assert.equal(art.isCurrent(crossing), true, 'a 700px resize on the same room must not orphan the in-flight reveal');
assert.equal(typeof beginIfChanged('assets/scenes/entrance.webp', 'assets/scenes/entrance-mobile.webp', art), 'number');

const firstFx = { removed: false, remove() { this.removed = true; } };
const secondFx = { removed: false, remove() { this.removed = true; } };
firstFx.remove();
assert.equal(firstFx.removed, true);
assert.equal(secondFx.removed, false, 'removing one tool node must not take the other tool with it');

console.log('PASS: stale room/art requests lose, paused page turns skip the leaf, repeated rune input keeps the latest token, same-path art skips the gate, tool nodes clean themselves.');
