import { createElement } from './utils.js';

export default class {
  el;
  labelEl;
  starClass;

  constructor(parentEl, name, starClass) {
    this.el                 = createElement(parentEl, 'li');
    this.labelEl            = createElement(this.el, 'span');
    this.labelEl.innerHTML  = name;
    this.starClass          = starClass;

    if (/\d/.test(name))      { this.el.classList.add('compact'); }
    if (this.isScoopable())   { this.el.classList.add('scoopable'); }
    if (this.isSupercharge()) { this.el.classList.add('supercharge'); }
    if (this.isWhiteDwarf())  { this.el.classList.add('white-dwarf'); }
    if (this.isBlackHole())   { this.el.classList.add('black-hole'); }
    this.el.classList.add('Class_' + this.starClass);
  }

  isScoopable() {
    return [ 'O', 'B', 'A', 'F', 'G', 'K', 'M' ].includes(this.starClass);
  }

  isSupercharge() {
    return /^(N|D.*)$/.test(this.starClass);
  }

  isWhiteDwarf() {
    return /^D/.test(this.starClass);
  }

  isBlackHole() {
    return this.starClass === 'H';
  }

  getPointSize() {
    return parseInt(window.getComputedStyle(this.el,'::after').width, 10);
  }

  getDomElementPosition() {
    return {
      left: this.el.offsetLeft + this.el.offsetWidth - (this.getPointSize() / 2),
      top:  this.el.offsetTop + this.el.offsetHeight - (this.getPointSize() / 2),
    };
  }
}
