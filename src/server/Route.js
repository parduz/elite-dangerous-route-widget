const fs = require('fs');

function DebugLog(dbgStr) {
	//console.log( new Date(), '- - - Route.js - ', dbgStr);
	console.log('- - - Route.js - ', dbgStr);
}

module.exports = class Route {
  filename;
  steps;
  onChange;

  constructor(filename) {
    this.filename = filename;
DebugLog('Route class filename:' + filename);
  }

  watchFile() {
    this.updateFromFile();

    let watchTimeout;

    fs.watch(this.filename, () => {
      if (watchTimeout) { clearTimeout(watchTimeout); } // prevent duplicated watch notifications

      watchTimeout = setTimeout(() => {
DebugLog('watchRoute: change detected');
        this.updateFromFile();
      }, 100);
    });
  }

  updateFromFile() {
DebugLog('updateFromFile()');
    this.steps = JSON.parse(fs.readFileSync(this.filename)).Route;
DebugLog(this.steps.length -1 + 'steps');
    this.update();
  }

  update() {
DebugLog('update()');
    if (typeof this.onChange === 'function') {
      this.onChange(this.steps);
    }
  }

  getRemainingJump(currentSystemName) {
    let remainingJump = 0;

    this.steps.forEach((system, index) => {
      if (currentSystemName === system.StarSystem) {
        remainingJump = this.steps.length -1 - index;
      }
    });
DebugLog('remainingJump:' + remainingJump);
    return remainingJump;
  }

  getStepByName(name) {
DebugLog('getStepByName');
    return this.steps.find(step => step.StarSystem === name);
  }
}
