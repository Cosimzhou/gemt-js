/********************************
 *
 * TChord
 * @constructor
 *
 *******************************/
function TChord() {
  this.notes = [...arguments];
  var n = this.notes[0] || {};
  this.endBeat = n.endBeat;
  this.startBeat = n.startBeat;
  this.beat = n.beat;
}
exports.TChord = TChord;

TChord.prototype._match = function(tn) {
  var n = this.notes[0];
  return n ? n._match(tn) : false;
}

TChord.prototype.elapse = function() {
  return this.beat;
}

TChord.prototype._sound = function(ctx, offset) {
  for (var i = 0, n; n = this.notes[i]; ++i) {
    n._sound(ctx, offset);
  }
}
