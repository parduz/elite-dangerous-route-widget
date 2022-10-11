const fs = require('fs');

function DebugLog(dbgStr) {
	//console.log( new Date(), '- - - GameStatus.js - ', dbgStr);
	console.log('- - - GameStatus.js - ', dbgStr);
}

module.exports = class Status {
  filename;
  status;
  onChange;

  constructor(filename) {
    this.filename = filename;
  }

  watchFile() {
    this.updateFromFile();

    let watchTimeout;

    fs.watch(this.filename, () => {
      if (watchTimeout) { clearTimeout(watchTimeout); } // prevent duplicated watch notifications

      watchTimeout = setTimeout(() => {
        //DebugLog('watchStatus: change detected');
        this.updateFromFile();
      }, 100);
    });
  }

  updateFromFile() {
    try {
      this.status = JSON.parse(fs.readFileSync(this.filename));
      //DebugLog('status:' + this.status);
      this.update();

    } catch(e) {
      // do nothing
    }
  }

  update() {
    if (typeof this.onChange === 'function') {
      this.onChange(this.status);
    }
  }
}
