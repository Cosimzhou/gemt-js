/*********************************
 *
 * MNote
 * @constructor
 *******************************/
function MNote(h) {
  this.pitch = h;
}
exports.MNote = MNote;


MNote.comparator = function(a, b) { return a.pitch - b.pitch; }
/********************************
 * 获取音名
 *******************************/
MNote.prototype.tone = function() {
  return MConst.ToneList[this.pitch % 12];
}
/********************************
 * 获取完整音名
 *******************************/
MNote.prototype.fulltone = function() {
  return MConst.ToneList[this.pitch % 12] + (this.pitch / 12);
}

/********************************
 *
 * 移调
 *******************************/
MNote.prototype.shift = function(n) {
  this.pitch += n;
}

//MNote.prototype.order = function(t) {
//    var idx = ((this.pitch % 12) + 12 - t)%12, mod = idx>4? 1: 0;
//    return idx%2 == mod? (idx+mod)>>1: null;    // major tone
//}
MNote.prototype.clone = function() {
  return new MNote(this.pitch);
}
