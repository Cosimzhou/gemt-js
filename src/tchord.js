/**
 *
 *  TChord
 *
 */
function TChord() {
  this.notes = [...arguments];
  var n = this.notes[0]||{};
  this.endBeat = n.endBeat;
  this.startBeat = n.startBeat;
  this.beat = n.beat;
}
exports['TChord'] = TChord;
TChord.prototype.match = function(tn){
  var n = this.notes[0];
  return n? n.match(tn): false;
}
TChord.prototype.elapse = function(){
  return this.beat;
  //return this.endBeat - this.startBeat;
}
