//import { createElement }  from './modules/utils.js';
function createElement(parentEl = document.body, tagName = 'div') {
  const el = document.createElement(tagName);
  parentEl.appendChild(el);
  return el;
}


//import handles from './modules/handles.js';
//import Info    from './modules/Info.js';

//---import RouteClass   from './modules/Route.js';
class SystemClass {
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

class RouteClass {
  el;
  routeEl;
  systemList;
  currentSystemName;
  centerViewTimeout;
  onArrival;

  constructor(parentEl) {
    this.el = createElement(parentEl);
    this.el.classList.add('route-container');

    this.routeEl = createElement(this.el, 'ul');
    this.systemList = {};
    this.steps;
    this.currentSystemName;
  }

  setSteps(steps) {
    this.routeEl.innerHTML = '';
    this.systemList = {};
    this.steps = steps;

    steps.forEach((step, index) => {
      const system = new SystemClass(this.routeEl, step.StarSystem, step.StarClass);

      this.systemList[step.StarSystem] = system;

      if (this.currentSystemName == step.StarSystem) {
        system.el.classList.add('current');
        this.centerView();
        this.checkArrival();
      }
    });
  }

  setCurrentSystem(systemName) {
    if (this.currentSystemName && this.systemList[this.currentSystemName]) {
      this.systemList[this.currentSystemName].el.classList.remove('current')
    }

    if (systemName && this.systemList[systemName]) {
      const system = this.systemList[systemName];
      system.el.classList.remove('jumping');
      system.el.classList.add('current');
      this.centerView();
      this.checkArrival();
      this.currentSystemName = systemName;
    }
  }

  getRemainingJump() {
    return this.steps.length -1 - this.steps.findIndex(step => step.StarSystem === this.currentSystemName);
  }

  checkArrival() {
    if (this.isArrival()) {
      if (typeof this.onArrival === 'function') {
        this.onArrival(this.currentSystemName);
      }
    }
  }

  isArrival() {
    return this.getRemainingJump() === 0;
  }

  jump(systemName) {
    if (this.currentSystemName && this.systemList[this.currentSystemName]) {
      this.systemList[this.currentSystemName].el.classList.remove('current')
    }

    if (systemName && this.systemList[systemName]) {
      this.systemList[systemName].el.classList.add('jumping');
      this.currentSystemName = systemName;
      this.centerView(550);
    }
  }

  centerView(delay = 0) {
    clearTimeout(this.centerViewTimeout);

    this.centerViewTimeout = setTimeout(() => {
      if (this.currentSystemName && this.systemList[this.currentSystemName]) {
        const currentSystemElementPosition = this.systemList[this.currentSystemName].getDomElementPosition();
        const newScrollPosition = {
          left: currentSystemElementPosition.left - (this.el.offsetWidth / 2),
          top:  currentSystemElementPosition.top - (this.el.offsetHeight / 2),
        };
        this.el.scrollTo({left: newScrollPosition.left, top: newScrollPosition.top, behavior: "smooth"});
      }
    }, delay);
  }
}
const route   = new RouteClass();

//---import GuiClass     from './modules/Gui.js';
class GuiClass {
  config = {};
  autohideTimeout;

  constructor(config = {}) {
    this.setState(config);
  }

  setState(config) {
    this.config = config;

    typeof config.guiScale !== 'undefined'   && this.setScale(config.guiScale);
    typeof config.autohide !== 'undefined'   && this.setAutohide(config.autohide.enabled);
    typeof config.hide !== 'undefined'       && this.setHide(config.hide);
    typeof config.compact !== 'undefined'    && this.setCompact(config.compact);
    typeof config.themeColor !== 'undefined' && this.setColor(config.themeColor);
    typeof config.shadow !== 'undefined'     && this.setShadow(config.shadow);
    typeof config.fullColor !== 'undefined'  && this.setFullColor(config.fullColor);
  }

  setScale(scale) {
    document.documentElement.style.setProperty('--gui-scale', scale);
    this.config.guiScale = scale;
  }

  setCompact(compact) {
    document.documentElement.style.setProperty('--compact', compact ? 'var(--on)' : 'var(--off)');
    this.config.compact = compact;
  }

  setAutohide(autohide) {
    document.documentElement.classList.toggle('gui-autohide', autohide);
    this.config.autohide.enabled = autohide;
  }

  setHide(hide) {
    document.documentElement.classList.toggle('gui-hidden', hide);
    this.config.hide = hide;
  }

  setColor(color) {
    document.documentElement.style.setProperty('--color-theme', color);
    this.config.themeColor = color;
  }

  setShadow(isShadowOn) {
    document.documentElement.style.setProperty('--color-background', isShadowOn ? '#000C' : 'transparent');
    this.config.shadow = isShadowOn;
  }

  setFullColor(isFullColored) {
    document.documentElement.style.setProperty('--color-off', isFullColored ? 'var(--color-theme)' : 'var(--color-on)');
    document.documentElement.style.setProperty('--color-off-alpha', isFullColored ? '.5' : '.4');
    this.config.fullColor = isFullColored;
  }

  resetAutohideTimeout() {
    this.clearAutohideTimeout();
    if (this.config.autohide.delay) {
      this.autohideTimeout = setTimeout(() => document.documentElement.classList.add('gui-autohide--timeout'), this.config.autohide.delay * 1000);
    }
  }

  clearAutohideTimeout() {
    clearTimeout(this.autohideTimeout);
    document.documentElement.classList.remove('gui-autohide--timeout');
  }
}
const gui     = new GuiClass();

const socket  = io();
document.getElementById('check').innerHTML += (typeof io === 'undefined')		? " <p>NO IO</p>"      :" <p>IO ok</p>";
document.getElementById('check').innerHTML += (typeof socket === 'undefined')	? " <p>NO SOCKET</p>"  :" <p>Socket ok</p>";

//const info    = new Info(createElement());
window.route  = route;
window.gui    = gui;

window.addEventListener('resize', () => route.centerView() );

//[route.el, info.el].forEach(el => el.classList.add('gui'));

[route.el].forEach(el => el.classList.add('gui'));



/*
 * Route
 */
route.onArrival = systemName => {
  // TODO: display the arrival system name instead of the route
}


/*
 * Socket
 */
//document.getElementById('check').innerHTML = socket.connect();
socket.on('connect', () => {
  socket.emit('clientInfo', {
    origin: window.location.origin,
    platform: navigator.platform
  });
  document.getElementById('check').innerHTML = "<p>Connect</p>";
});
/*
handles.unlock();
socket.on('unlock', () => {
  handles.unlock();
});

socket.on('lock', () => {
  handles.lock();
});
*/
socket.on('config', config => {
  //console.log('config: receive');
  gui.setState(config);
  route.centerView(550);
  document.getElementById('check').innerHTML = "<p>Config</p>";
});

socket.on('stats', stats => {
  //console.log('stats:', stats);
//  info.setState(stats);
  document.getElementById('check').innerHTML = "<p>Stats</p>";
});

socket.on('route', steps => {
  document.getElementById('check').innerHTML = "<p>Route: " + steps + "</p>";
  //console.log('route:', steps);
  route.setSteps(steps);
  gui.resetAutohideTimeout();
});

socket.on('locate', systemName => {
  document.getElementById('check').innerHTML = "<p>locate: " + systemName + "</p>";
  // console.log('system:', systemName);
  route.setCurrentSystem(systemName);
  gui.resetAutohideTimeout();
});

socket.on('jumping', systemName => {
  document.getElementById('check').innerHTML = "<p>jumping: " + systemName + "</p>";
  // console.log('jumping:', systemName);
  route.jump(systemName);
  gui.clearAutohideTimeout();
});

socket.on('expedition:waypoints', waypoints => {
  document.getElementById('check').innerHTML = "<p>waypoints: " + waypoints + "</p>";
  console.log('expedition:waypoints', waypoints);
});

socket.on('expedition:progression', progression => {
  document.getElementById('check').innerHTML = "<p>progression: " + progression + "</p>";
  console.log('expedition:progression', progression);
});

socket.on('status', status => {
  document.getElementById('check').innerHTML = "<p>status: " + status + "</p>";
  //console.log('status:', status);
  const inGameMenuFocus = typeof status.GuiFocus === 'undefined' || status.GuiFocus !== 0;
  document.documentElement.classList.toggle('in-game-menu-focus', gui.config.autohide.onInGameMenu && inGameMenuFocus);
});
document.getElementById('check').innerHTML = "<p>"+socket.io.uri+" - "+(socket.connected?"Connected":"Disconnected")+"</p>";