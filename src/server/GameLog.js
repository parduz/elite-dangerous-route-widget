const fs          = require('fs');
const glob        = require('glob');
const lineReader  = require('line-reader');
const StarSystem  = require('./StarSystem');

function DebugLog(dbgStr) {
	//console.log( new Date(), '- - - GameLog.js - ', dbgStr);
	console.log('- - - GameLog.js - ', dbgStr);
}


module.exports = class GameLog {
  eliteLogDir;
  isJumping = false;
  _dirWatcher;
  _currentShip;
  _lastShipId;
  lastJumpSystem;
  _lastSystem;
  _lastLogFilePath;
  _prevLogFilePath;
  currentSystem;

  onJump;
  onLocate;
  onShipChange;

  constructor(eliteLogDir) {
    this.eliteLogDir = eliteLogDir;
  }

  watchLog() {
    let watchTimeout;

    this._dirWatcher = fs.watch(this.eliteLogDir, () => {
      if (watchTimeout) { clearTimeout(watchTimeout); } // prevent duplicated watch notifications

      watchTimeout = setTimeout(() => {
        //DebugLog('watchLog: change detected');
        this.watchLogFromMostRecentFile();
      }, 100);
    });

    this.watchLogFromMostRecentFile();
  }

  watchLogFromMostRecentFile() {
    this._lastLogFilePath = glob.sync(this.eliteLogDir + '/*.log')
      .map(name => ({name, ctime: fs.statSync(name).ctime}))
      .sort((a, b) => b.ctime - a.ctime)[0].name;

    if (this._lastLogFilePath !== this._prevLogFilePath) {
      DebugLog('file used: ' + this._lastLogFilePath);
      this._prevLogFilePath = this._lastLogFilePath;

      if ( this._dirWatcher) {  this._dirWatcher.close(); }

      fs.watchFile(this._lastLogFilePath, { interval: 1000 }, () => {
        //DebugLog('watchLogFromMostRecentFile: change detected');
        this.dispatchLogEvents();
      });

      this.dispatchLogEvents();
    }
  }

  dispatchLogEvents() {
    lineReader.eachLine(this._lastLogFilePath, (line, ThisIsTheLastOne) => {
      const log = JSON.parse(line);
      let nextSystem;
      let noLog;

      noLog = false;
      switch (log.event) {
        case 'Loadout':
          this._currentShip = {
            shipId: log.ShipID,
            ship: log.Ship,
            shipName: log.ShipName,
            shipIdent: log.ShipIdent,
            maxJumpRange: log.MaxJumpRange
          };
          break;

        case 'StartJump':
          if (log.JumpType === "Hyperspace") {
            this.isJumping = true;
            nextSystem = new StarSystem(log.StarSystem);
            DebugLog('* Hyperspace!');
          }
          break;

        case 'Location':
        case 'FSDJump':
        case 'CarrierJump':
          this.isJumping = false;
          this.currentSystem = new StarSystem(log.StarSystem, log.StarPos);
          DebugLog('* NewLocation');
          break;

        case 'Shutdown':
          fs.unwatchFile(this._lastLogFilePath);
          this.watchLog();
          break;

        case 'Backpack'             :
        case 'Cargo'                :
        case 'Commander'            :
        case 'Disembark'            :
        case 'Docked'               :
        case 'DockingDenied'        :
        case 'DockingGranted'       :
        case 'DockingRequested'     :
        case 'Embark'               :
        case 'EngineerProgress'     :
        case 'Fileheader'           :
        case 'Friends'              :
        case 'FSDTarget'            :
        case 'FSSAllBodiesFound'    :
        case 'FSSBodySignals'       :
        case 'FSSDiscoveryScan'     :
        case 'FSSSignalDiscovered'  :
        case 'FuelScoop'            :
        case 'JetConeBoost'         :
        case 'LoadGame'             :
        case 'Materials'            :
        case 'Missions'             :
        case 'ModuleInfo'           :
        case 'Music'                :
        case 'NavRoute'             :
        case 'Progress'             :
        case 'Rank'                 :
        case 'ReceiveText'          :
        case 'RefuelAll'            :
        case 'Reputation'           :
        case 'ReservoirReplenished' :
        case 'SAAScanComplete'      :
        case 'Scan'                 :
        case 'ScanBaryCentre'       :
        case 'Screenshot'           :
        case 'SendText'             :
        case 'ShipLocker'           :
        case 'ShipTargeted'         :
        case 'Shipyard'             :
        case 'ShipyardSwap'         :
        case 'SquadronStartup'      :
        case 'Statistics'           :
        case 'StoredShips'          :
        case 'SuitLoadout'          :
        case 'Undocked'             :
        case 'WingAdd'              :
        case 'WingInvite'           :
        case 'WingJoin'             :
        case 'WingLeave'            :
          // Do nothing
          noLog = true;
          break;

        default:
          // Do nothing
          DebugLog('UNKNOWN EVENT: ' + log.event);
      }

      if (ThisIsTheLastOne) {
        if (this._currentShip) {
DebugLog('-- ship: [ id:' + this._currentShip.shipId + '| type:' + this._currentShip.ship + '| name:' + this._currentShip.shipName + '| ident:' + this._currentShip.shipIdent + ']');
DebugLog('-- ship: [ Last id:' + this._lastShipId, ']');
          if (this._currentShip.shipId && this._lastShipId !== this._currentShip.shipId) {
            this._lastShipId = this._currentShip.shipId;
            if (typeof this.onShipChange === 'function') this.onShipChange(this._currentShip);
          }
        }else{
DebugLog('-- ship: No current ship!');
        }

        if (this.isJumping) {
          if (
           (nextSystem && nextSystem.name) // nextSystem should exists and have a name
           &&
           (!this.lastJumpSystem || (this.lastJumpSystem.name !== nextSystem.name)) // and lastJumpSystem shouldn't exists or have a different name
          ) {
            // so, we're jumping in nextSystem.
DebugLog('-- jumping: ' + nextSystem);
            this.lastJumpSystem = nextSystem;
            if (typeof this.onJump === 'function') this.onJump(nextSystem);
          }else{
DebugLog('-- jumping: no nextSystem');
          }

        } else if (
         (this.currentSystem && this.currentSystem.name) // currentSystem should exists and have a name
         &&
         (!this._lastSystem || (this._lastSystem.name !== this.currentSystem.name))  // and _lastSystem shouldn't exists or have a different name
        ) {

DebugLog('-- system:' + this.currentSystem);
          this._lastSystem = this.currentSystem;
          if (typeof this.onLocate === 'function') this.onLocate(this.currentSystem);
        }
else DebugLog('-- Location: no currentSystem');

      } // End of "if (ThisIsTheLastOne)"
else{
  if (noLog === false) DebugLog('.. This Is Not The Last One');
}

    }); // End of "lineReader"
  }
}
