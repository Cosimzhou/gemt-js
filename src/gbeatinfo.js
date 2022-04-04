function GBeatInfo(x, row, beat) {
  this.x = x;
  this.rowIndex = row;
  this.beat = beat;
}
impl(GBeatInfo, MRepeatElement);

GBeatInfo.prototype._attach = function(barl) {
  this.func = barl._barlineType;
}

GBeatInfo.prototype.clone = function() {
  var newObj = new GBeatInfo(this.x, this.rowIndex, this.beat);
  return newObj;
}

GBeatInfo.prototype._seqVal = function() {
  return this.beat;
}

GBeatInfo.prototype._shift = function(v) {
  this.beat += v;
}
