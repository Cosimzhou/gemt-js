/********************************
 *
 *   MTimeSlice
 *
 *******************************/
function MTimeSlice(b, s) {
  this.beatlen = b||0;
  this.start = s;
}
exports['MTimeSlice'] = MTimeSlice;
MTimeSlice.prototype.equal = function(diff) {
  return this.beatlen + (diff.beatlen != null? diff.beatlen: diff);
}
MTimeSlice.prototype.less = function(obj) {
  return this.beatlen < (obj.beatlen != null? obj.beatlen: obj);
}
MTimeSlice.prototype.add = function(diff) {
  return this.beatlen + (diff.beatlen != null? diff.beatlen: diff);
}
MTimeSlice.prototype.sub = function(diff) {
  return this.beatlen - (diff.beatlen != null? diff.beatlen: diff);
}
MTimeSlice.prototype.addTo = function(diff) {
  this.beatlen += diff.beatlen != null? diff.beatlen: diff;
  return this;
}
MTimeSlice.prototype.subTo = function(diff) {
  this.beatlen -= diff.beatlen != null? diff.beatlen: diff;
  return this;
}
MTimeSlice.prototype.movTo = function(diff) {
  this.beatlen = diff.beatlen != null? diff.beatlen: diff;
  return this;
}
MTimeSlice.prototype.after = function(obj) {
  return this.start > obj;// = diff.beatlen != null? diff.beatlen: diff;
}
MTimeSlice.prototype.clone = function() {
  var obj = new MTimeSlice();
  obj.beatlen = this.beatlen;
  obj.start = this.start;
  return obj;
}
MTimeSlice.prototype.endBeat = function() {
  return this.start+this.beatlen;
}
MTimeSlice.prototype.set = function(b,s) {
  this.beatlen = b;
  this.start = s;
  return this;
}
MTimeSlice.prototype.setSlice = function(s,e) {
  this.beatlen = e-s;
  this.start = s;
  return this;
}
MTimeSlice.prototype.follow = function(mts) {
  this.start = mts.endBeat();
  return this;
}


