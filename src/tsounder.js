/********************************
 * TSounder
 * 
 * @constructor
 ********************************/

function TSounder() {
  this._noteOn_f = null;
  this._noteOff_f = null;
  this._volume_f = null;
  this._instrument_f = null;
  this._stop_f = null;
}
exports.TSounder = TSounder;

TSounder.prototype.adapt = function(adapter) {
  this._noteOn_f = adapter['noteOn'];
  this._noteOff_f = adapter['noteOff'];
  this._volume_f = adapter['setVolume'];
  this._instrument_f = adapter['programChange'];
  this._stop_f = adapter['stopAllNotes'];
}

TSounder.prototype.noteOn = function(chn, note, vec, delay) {
  if (this._noteOn_f) {
    this._noteOn_f(chn, note, vec, delay);
  }
}

TSounder.prototype.noteOff = function(chn, note, vec, delay) {
  if (this._noteOff_f) {
    this._noteOff_f(chn, note, delay);
  }
}

TSounder.prototype.volume = function(chn, vol) {
  if (this._volume_f) {
    this._volume_f(chn, vol);
  }
}

TSounder.prototype.instrument = function(chn, ins, param) {
  if (this._instrument_f) {
    this._instrument_f(chn, ins, param);
  }
}

TSounder.prototype.stop = function() {
  if (this._stop_f) {
    this._stop_f();
  }
}