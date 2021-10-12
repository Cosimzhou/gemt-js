function GBeatInfo(x, row, beat) {
  this.x = x;
  this.rowIndex = row;
  this.beat = beat;
}

GBeatInfo.prototype._attach = function(barl) {
  this.func = barl._barlineType;
}
