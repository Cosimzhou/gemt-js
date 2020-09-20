/********************************
 *
 *  TTrack
 *
 *******************************/
function TTrack() {
  this.notes = [...arguments];
}
exports['TTrack'] = TTrack;
TTrack.prototype.append = function(e){
  this.notes.push(e);
}
TTrack.prototype.detectBeat = function(){
  if (this.notes.length <= 0) {
    return;
  }

  var elaset = new Set();
  for (var e of this.notes) {
    elaset.add(e.elapse());
  }
  //elas = Array.from(elaset).map(function(e){return parseInt(e)+1}).sort(function(a,b){return a-b});
}

///
//  用于整合多个同时触发的音符，合为一个和弦
TTrack.prototype.fusion = function (){
  var arr = [], tch = new TChord();
  for (var e, i = 0; e = this.notes[i]; ++i) {
  if (e.endBeat == null) {
    //console.log(e);
  }

  if (tch.startBeat == e.startBeat) {
    if (tch.match(e)) {
      tch.notes.push(e);
    } else {
      // TODO: ff
      tch.notes.push(e);
      //console.log("mismatch", tch,e);
    }
    continue;
  } else if (tch.endBeat > e.startBeat) {
    tch.notes.push(e);
    tch.arpeggio = true;
    if (e.endBeat > tch.endBeat) {
      tch.endBeat = e.endBeat;
      tch.beat = tch.endBeat - tch.startBeat;
    }
    continue;
  }

  tch = new TChord(e);
  arr.push(tch);
  }

  this.chords = arr;
}
