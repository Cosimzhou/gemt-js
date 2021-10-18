/********************************
 *
 *   GTimeSlice
 *
 *******************************/
function GTimeSlice(b, s) {
  this.beatlen = b || 0;
  this._start = s;
}
exports.GTimeSlice = GTimeSlice;

GTimeSlice.prototype._equal = function(diff) {
  return this.beatlen + (diff.beatlen != null ? diff.beatlen : diff);
}

GTimeSlice.prototype.less = function(obj) {
  return this.beatlen < (obj.beatlen != null ? obj.beatlen : obj);
}

GTimeSlice.prototype.add = function(diff) {
  return this.beatlen + (diff.beatlen != null ? diff.beatlen : diff);
}

GTimeSlice.prototype.sub = function(diff) {
  return this.beatlen - (diff.beatlen != null ? diff.beatlen : diff);
}

GTimeSlice.prototype.addTo = function(diff) {
  this.beatlen += diff.beatlen != null ? diff.beatlen : diff;
  return this;
}

GTimeSlice.prototype.subTo = function(diff) {
  this.beatlen -= diff.beatlen != null ? diff.beatlen : diff;
  return this;
}

GTimeSlice.prototype.movTo = function(diff) {
  this.beatlen = diff.beatlen != null ? diff.beatlen : diff;
  return this;
}

GTimeSlice.prototype.after = function(obj) {
  return this._start > obj; // = diff.beatlen != null? diff.beatlen: diff;
}

GTimeSlice.prototype.clone = function() {
  var obj = new GTimeSlice();
  obj.beatlen = this.beatlen;
  obj._start = this._start;
  return obj;
}

GTimeSlice.prototype.endBeat = function() {
  return this._start + this.beatlen;
}

GTimeSlice.prototype.setEndBeat = function(endBeat) {
  this.beatlen = endBeat - this._start;
}

GTimeSlice.prototype.set = function(b, s) {
  this.beatlen = b;
  this._start = s;
  return this;
}

GTimeSlice.prototype.setSlice = function(s, e) {
  this.beatlen = e - s;
  this._start = s;
  return this;
}

GTimeSlice.prototype.follow = function(mts) {
  this._start = mts.endBeat();
  return this;
}
