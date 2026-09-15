import { translate } from './locale.js';

let language = 'en';
try { if (localStorage.getItem('ember-language') === 'ko') language = 'ko'; } catch { /* Language switching also works without storage. */ }
const sources = new WeakMap();
export const getLanguage = () => language;
export const t = text => translate(text, language);

function translated(owner, key, current) {
  let record = sources.get(owner);
  if (!record) { record = {}; sources.set(owner, record); }
  const previous = record[key];
  const source = previous && current === previous.value ? previous.source : current;
  const value = t(source);
  record[key] = { source, value };
  return value;
}

export function localize(root = document.documentElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim() || node.parentElement.closest('script, style, [translate="no"]')) continue;
    node.textContent = translated(node, 'text', node.textContent);
  }
  for (const node of [root, ...root.querySelectorAll('[aria-label], [title], img[alt]')]) {
    if (node.closest('[translate="no"]')) continue;
    for (const key of ['aria-label', 'title', 'alt']) {
      if (node.hasAttribute(key)) node.setAttribute(key, translated(node, key, node.getAttribute(key)));
    }
  }
  document.documentElement.lang = language;
  for (const button of document.querySelectorAll('[data-language]')) {
    button.textContent = language === 'en' ? '한국어' : 'English';
    button.lang = language === 'en' ? 'ko' : 'en';
    button.setAttribute('aria-label', language === 'en' ? 'Switch to Korean' : '영어로 전환');
  }
}

export function setLanguage(next) {
  language = next === 'ko' ? 'ko' : 'en';
  try { localStorage.setItem('ember-language', language); } catch { /* This visit still retains its selected language. */ }
  localize();
}
