/********************************
 *
 *  TTrack
 *
 * @constructor
 *******************************/
function TTrack() {
  this.notes = [...arguments];
}
exports.TTrack = TTrack;

TTrack.prototype.append = function(e) {
  this.notes.push(e);
}

TTrack.prototype.detectBeat = function() {
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
TTrack.prototype.fusion = function() {
  var arr = [],
    tch = new TChord();
  for (var e, i = 0; e = this.notes[i]; ++i) {
    if (e.endBeat == null) {
      //console.log(e);
    }

    if (tch.startBeat == e.startBeat) {
      if (tch._match(e)) {
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

TTrack.prototype.tempoFollow = function(tempos, tpb) {
  var ci = 0,
    tempo, next_tempo, spb = 1000000.0 / tpb;

  function tempoTheChords(me) {
    for (var ni = 0, note, notes = me.chords[ci++].notes; note = notes[ni]; ++
      ni) {
      note._rtstart = tempo._rttime + (note.stime - tempo.stime) * spb;
      note._rtend = tempo._rttime + (note.etime - tempo.stime) * spb;
    }
  }

  for (var ti = 0; ti < tempos.length; tempo = next_tempo, ++ti) {
    if (tempos[ti].subtype != "setTempo") continue;
    next_tempo = tempos[ti];
    if (tempo == null) {
      next_tempo._rttime = 0;
      continue;
    }
    spb = tempo.microsecondsPerBeat / 1000000.0 / tpb;
    next_tempo._rttime = tempo._rttime + (next_tempo.startBeat - tempo
      .startBeat) * spb;

    while (ci < this.chords.length) {
      if (this.chords[ci].startBeat >= next_tempo.startBeat)
        break;
      tempoTheChords(this);
    }
  }

  if (tempo) {
    spb = tempo.microsecondsPerBeat / 1000000.0 / tpb;
  }
  while (ci < this.chords.length) {
    tempoTheChords(this);
  }
}
