import { localize } from './language.js';
import { projects } from './project-records.js';

export function readingIndex(value, pageCount) {
  return Number.isInteger(value) ? Math.max(0, Math.min(pageCount - 1, value)) : 0;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, className, action) {
  const node = element('button', className, label);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

export class BookReader {
  constructor(dialog, { onEffect = () => {} } = {}) {
    this.dialog = dialog;
    this.onEffect = onEffect;
    this.project = null;
    this.index = 0;
    this.opener = null;
    this.turn = null;
    this.wide = matchMedia('(min-width: 701px)');
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.shell = element('div', 'reader-shell');
    const top = element('header', 'reader-top');
    const heading = element('div');
    this.meta = element('p', 'page-section');
    this.title = element('h2');
    this.title.id = 'book-title';
    heading.append(this.meta, this.title);
    this.closeButton = button('×', 'icon-button', () => this.close());
    this.closeButton.setAttribute('aria-label', 'Close the project record and return to the archive');
    const actions = element('div', 'reader-actions');
    const language = element('button', 'control language-toggle', '한국어');
    language.dataset.language = '';
    language.setAttribute('translate', 'no');
    actions.append(language, this.closeButton);
    top.append(heading, actions);

    this.tabs = element('nav', 'reader-tabs');
    this.tabs.setAttribute('aria-label', 'Project sections');
    this.sectionButtons = ['Game overview', 'Development notes'].map(section => {
      const tab = button(section, 'control', () => {
        const target = this.project.pages.findIndex(page => page.section === section);
        if (target !== -1) this.goTo(target);
      });
      this.tabs.append(tab);
      return tab;
    });

    this.spread = element('div', 'book-spread');
    const bottom = element('footer', 'reader-bottom');
    const navigation = element('div', 'page-nav');
    navigation.setAttribute('aria-label', 'Turn pages');
    this.previous = button('← Previous', 'control', () => this.step(-1));
    this.next = button('Next →', 'control', () => this.step(1));
    navigation.append(this.previous, this.next);
    this.progress = element('p', 'page-progress');
    this.progress.setAttribute('role', 'status');
    this.progress.setAttribute('aria-live', 'polite');
    this.progress.setAttribute('aria-atomic', 'true');
    bottom.append(this.progress, navigation);
    this.shell.append(top, this.tabs, this.spread, bottom);
    dialog.replaceChildren(this.shell);
    dialog.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        this.step(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    dialog.addEventListener('close', () => {
      this.stopTurn();
      if (!dialog.open && this.opener?.isConnected) this.opener.focus({ preventScroll: true });
    });
    this.wide.addEventListener('change', () => {
      if (dialog.open) {
        this.stopTurn();
        this.render();
      }
    });
    this.reduced.addEventListener('change', () => this.stopTurn());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopTurn();
    });
  }

  get pageWidth() {
    return this.wide.matches ? 2 : 1;
  }

  open(projectId, section = '') {
    const project = projects.find(item => item.id === projectId);
    if (!project) return;
    this.stopTurn();
    if (!this.dialog.open) this.opener = document.activeElement;
    this.project = project;
    let saved = 0;
    try {
      saved = Number(localStorage.getItem(`ember-book-${project.id}`));
    } catch {
      // Reading still works when the browser blocks local storage.
    }
    const sectionIndex = project.pages.findIndex(page => page.section.toLowerCase() === section.toLowerCase());
    this.index = readingIndex(sectionIndex === -1 ? saved : sectionIndex, project.pages.length);
    this.meta.textContent = `Ember Studio Archive · Project ${project.number}`;
    this.title.textContent = project.title;
    this.dialog.dataset.project = project.id;
    this.render();
    if (!this.dialog.open) this.dialog.showModal();
    localize(this.dialog);
    this.closeButton.focus({ preventScroll: true });
    this.onEffect('book');
  }

  close() {
    this.stopTurn();
    if (this.dialog.open) this.dialog.close();
  }

  step(direction) {
    if (!this.project || !this.dialog.open) return;
    if (direction > 0 && this.index + this.pageWidth >= this.project.pages.length) return;
    this.goTo(this.index + direction * this.pageWidth);
  }

  goTo(target) {
    const nextIndex = readingIndex(target, this.project.pages.length);
    if (nextIndex === this.index) return;
    this.stopTurn();
    const forward = nextIndex > this.index;
    const outgoing = this.spread.querySelector(forward && this.wide.matches ? '.right-page' : '.left-page');
    const leaf = outgoing?.cloneNode(true);
    this.index = nextIndex;
    this.render();
    this.onEffect('page');
    if (!leaf || this.reduced.matches || document.hidden) return;
    leaf.classList.add('turning-leaf');
    leaf.setAttribute('aria-hidden', 'true');
    leaf.inert = true;
    Object.assign(leaf.style, {
      position: 'absolute',
      insetBlockStart: '0',
      insetInlineStart: forward && this.wide.matches ? '50%' : '0',
      width: this.wide.matches ? '50%' : '100%',
      height: '100%',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      transformOrigin: forward ? 'left center' : 'right center',
      backfaceVisibility: 'hidden',
      zIndex: '3'
    });
    this.spread.classList.add(forward ? 'turning-forward' : 'turning-backward');
    this.spread.append(leaf);
    const animation = leaf.animate([
      { transform: 'perspective(1400px) rotateY(0deg)', opacity: 1 },
      { transform: `perspective(1400px) rotateY(${forward ? -90 : 90}deg)`, opacity: 1, offset: 0.7 },
      { transform: `perspective(1400px) rotateY(${forward ? -170 : 170}deg)`, opacity: 0 }
    ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    this.turn = { animation, leaf };
    animation.finished.then(() => {
      if (this.turn?.animation === animation) this.stopTurn();
    }).catch(() => {});
  }

  stopTurn() {
    if (this.turn) {
      this.turn.animation.cancel();
      this.turn.leaf.remove();
      this.turn = null;
    }
    this.spread.classList.remove('turning-forward', 'turning-backward');
  }

  render() {
    const pages = this.project.pages;
    const last = Math.min(pages.length - 1, this.index + this.pageWidth - 1);
    this.spread.replaceChildren(...pages.slice(this.index, last + 1).map((page, offset) => this.makePage(page, this.index + offset, offset)));
    this.previous.disabled = this.index === 0;
    this.next.disabled = last === pages.length - 1;
    if (document.activeElement === this.next && this.next.disabled) this.previous.focus();
    if (document.activeElement === this.previous && this.previous.disabled) this.next.focus();
    this.progress.textContent = `${this.index === last ? 'Page' : 'Pages'} ${this.index + 1}${this.index === last ? '' : `–${last + 1}`} of ${pages.length}`;
    this.sectionButtons.forEach((tab, index) => {
      const selected = pages[this.index].section === ['Game overview', 'Development notes'][index];
      tab.setAttribute('aria-current', selected ? 'location' : 'false');
      tab.classList.toggle('active', selected);
    });
    localize(this.dialog);
    try {
      localStorage.setItem(`ember-book-${this.project.id}`, String(this.index));
    } catch {
      // A blocked bookmark must never prevent a page turn.
    }
  }

  makePage(page, index, offset) {
    const paper = element('article', `book-page ${offset === 0 ? 'left-page' : 'right-page'}`);
    paper.setAttribute('aria-label', `Page ${index + 1}: ${page.title}`);
    paper.append(element('p', 'page-section', page.section), element('h3', 'page-title', page.title));
    const body = element('div', 'page-body');
    for (const paragraph of page.body) body.append(element('p', '', paragraph));
    paper.append(body);
    if (page.diagram) {
      const diagram = element('ol', `book-diagram ${page.diagram}`);
      diagram.setAttribute('aria-label', 'Conceptual gameplay sequence');
      const labels = page.diagram === 'golem' ? ['Place stone', 'Shape & activate', 'Send golems'] : ['Link guests', 'Ride the lift', 'Collect fees'];
      labels.forEach((label, step) => {
        const item = element('li');
        const mark = element('span', 'diagram-mark', String(step + 1).padStart(2, '0'));
        mark.setAttribute('aria-hidden', 'true');
        item.append(mark, element('span', 'diagram-label', label));
        diagram.append(item);
      });
      paper.append(diagram);
    }
    paper.append(element('p', 'page-note', page.note));
    for (const link of page.links ?? []) {
      const anchor = element('a', 'page-link', link.label);
      anchor.href = link.href;
      paper.append(anchor);
    }
    paper.append(element('span', 'page-number', String(index + 1).padStart(2, '0')));
    return paper;
  }
}
