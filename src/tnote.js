/********************************
 *
 * TNote
 * @constructor
 *
 *******************************/
function TNote(n, st, et=null, sv=null, ev=null) {
  this.nPitch = n;
  this.stime = st;
  this.etime = et || this.stime + 100;
  this.sveloc = sv;
  this.eveloc = ev;
}
exports['TNote'] = TNote;
TNote.prototype.elapse = function(){
  return this.etime - this.stime;
}
TNote.prototype.match = function(tn) {
  return this.startBeat == tn.startBeat && this.endBeat == tn.endBeat &&
      this.sveloc == tn.sveloc && this.eveloc == tn.eveloc;
}


