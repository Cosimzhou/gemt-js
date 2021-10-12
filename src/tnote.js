/********************************
 *
 * TNote
 * @constructor
 *
 *******************************/

function TNote(n, st, et = null, sv = null, ev = null) {
  this.nPitch = n;
  this.stime = st;
  this.etime = et || this.stime + 100;
  this.sveloc = sv || 127;
  this.eveloc = ev || 0;
}
exports.TNote = TNote;

TNote.prototype.elapse = function() {
  return this.etime - this.stime;
}

TNote.prototype._match = function(tn) {
  return this.startBeat == tn.startBeat && this.endBeat == tn.endBeat &&
    this.sveloc == tn.sveloc && this.eveloc == tn.eveloc;
}

TNote.prototype._sound = function(ctx, offset) {
  if (offset <= this._rtstart) {
    var channel = this._channel || 0;
    ctx.noteOn(channel, this.nPitch, this.sveloc, this._rtstart - offset);
    ctx.noteOff(channel, this.nPitch, this.eveloc, this._rtend - offset);
  }
}
