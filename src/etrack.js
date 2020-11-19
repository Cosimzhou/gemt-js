/********************************
 *
 * ETrack
 *      E层的轨
 * @constructor
 *
 * Args:
 *      score   EScore对象
 *
 *******************************/

function ETrack(sc) {
  this.score = sc;
  this.x = 0;
  this.gap = g_option.gap;
  this.marks = [];
  this.clefMarks = [];
  this.beatMarks = [];
}
exports.ETrack = ETrack;

ETrack.prototype.translate = function(l) {
  return this._y + l * this.gap;
}

ETrack.prototype.preview = function(ctx, x, y) {
  var ops = [], line;
  x += this.x;
  this._y = y;
  for (var i = 0; i < 5; i++) {
    ops.push(line = ctx._hline(x, y, this.score.trackLength));
    y+= this.gap;
  }
  ops.baseLine = line;
  return ops;
}

ETrack.prototype.append = function(mark) {
  this.marks.push(mark);
}
