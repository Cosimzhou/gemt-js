/**************************************************************
 *
 *  MConvert
 *
 *      This function converts T-layer staff into M-layer.
 *
 *  Arguments:
 *      tmidi_convertor     TMIDIConvertor
 *
 *  Return:                 MScore
 *
 *************************************************************/
function MConvert(tmidi_convertor) {
  function T2MChord(ch) {
    var mch = new MChord();
    var nset = new Set()
    for (var n, i = 0; n = ch.notes[i]; ++i) {
      if (!nset.has(n.nPitch)) {
        mch.notes.push(new MNote(n.nPitch));
        nset.add(n.nPitch);
      }
    }
    mch.notes.sort(function(a, b) {
      return a.pitch - b.pitch
    });
    mch.beat = new GTimeSlice(ch.beat, ch.startBeat);
    if (ch.beat == 0) {
      console.error("MConvert ch['beat'] == 0 "+ch+" "+mch);
    }
    mch.analysis();
    return mch;
  }
  var mscore = new MScore();
  var obj = {keySignature: {}};

  for (var e, i = 0; e = tmidi_convertor.eventList[i]; ++i) {
    if (obj[e.subtype] == null) {
      obj[e.subtype] = [];
    }
    if (e.subtype == 'keySignature') {
      if (obj[e.subtype][e.trkId] == null) {
        obj[e.subtype][e.trkId] = [];
      }
      obj[e.subtype][e.trkId].push(e);
    } else
      obj[e.subtype].push(e);
  }
  obj.timeSignature = obj['timeSignature'];
  obj.keySignature = obj['keySignature']||{};

  if (obj.timeSignature == null) {
    console.error('');
  }

  for (var t, it = 0; t = tmidi_convertor._tracks[it]; ++it) {
    if (t.chords.length == 0) continue;
    var mtrack = new MTrack();
    var mbar = new MBar();
    var mbeat = new MBeat();
    var curBeat = 0;
    var mchord = null;
    var timeSignatures = obj.timeSignature.concat();
    var keySignatures = obj.keySignature[it] && obj.keySignature[it].concat();
    var clef = null;
    if (keySignatures != null) {
      var tone = new MTone(0);
      tone.setKeySignature(keySignatures.shift().key);
      // TODO:
      clef = new MClef(mscore._tracks.length == 1 ? 1 : 0, tone);
    } else {
      var tone = new MTone(0);
      // TODO:
      clef = new MClef(mscore._tracks.length == 1 ? 1 : 0, tone);
    }

    mtrack.noteMax = t.noteHigh;
    mtrack.noteMin = t.noteLow;
    mtrack.append(mbar);
    mbar._timeBeat = mbeat;
    mbar._clef = clef;
    mbeat.set(timeSignatures.shift());
    // travel every chord in certain track
    for (var ch, ic = 0; ch = t.chords[ic];) {
      if (keySignatures && keySignatures.length &&
          curBeat > keySignatures[0].startBeat) {
        var tone = new MTone(0);
        tone.setKeySignature(keySignatures.shift().key);
        mbar._clef = new MClef(mscore._tracks.length == 1 ? 1 : 0, tone);
      }
      // treat timeSignatures
      if (timeSignatures[0] && curBeat > timeSignatures[0].startBeat) {
        mbar._timeBeat = new MBeat();
        mbar._timeBeat.set(timeSignatures.shift());
      }

      if (curBeat < ch.startBeat) {
        var diffBeat = ch.startBeat - curBeat;
        if ((mchord == null && diffBeat < 0.5) ||
            (mchord && diffBeat < mchord.beat.beatlen / 4)) {
          if (mchord) {
            // early close
            if (mbar.cap() >= diffBeat) {
              mchord.beat.addTo(diffBeat);
              mchord.dun = true;
              mchord.nths = mbar._timeBeat.nths(mchord.beat.beatlen);
              mbar.beat.addTo(diffBeat);
              curBeat = mchord.beat.endBeat();
            } else {
              var partBeat = mbar.cap();
              mchord.beat.addTo(partBeat);
              mchord.dun = true;
              mchord.nths = mbar._timeBeat.nths(mchord.beat.beatlen);
              mbar.beat.addTo(partBeat);

              diffBeat -= partBeat;
              var rest = new MRest();
              rest.beat = new GTimeSlice(diffBeat).follow(mchord.beat);
              mbar = mbar.feed(mtrack, rest);
              curBeat = rest.endBeat;
            }
          } else {
            // late open
            ch.startBeat = curBeat;
            ch.beat = ch.endBeat - ch.startBeat;
            ch.weak = true;
            curBeat = ch.endBeat;
          }
        } else {
          var rest = new MRest();
          rest.beat = new GTimeSlice(diffBeat, curBeat);
          mbar = mbar.feed(mtrack, rest);
          curBeat = rest.beat.endBeat();
        }
        continue;
      }
      mbar = mbar.feed(mtrack, mchord = T2MChord(ch));
      curBeat = ch.endBeat;
      ++ic;
    }

    if (obj.keySignature == null) {
      mtrack.analysis();
    } else {
    }
    mscore._tracks.push(mtrack);
  }


  for (var prebars, bars, rest_track, ib = 0;; ++ib) {
    bars = [];
    rest_track = 0;
    for (var cur_bar, it = 0; it < mscore._tracks.length; ++it) {
      bars.push(cur_bar = mscore._tracks[it].bars[ib]);
      if (cur_bar) {
        cur_bar._settle();
        rest_track++;
      }
    }
    if (rest_track == 0) break;

    // TODO : analysis
    prebars = bars;
  }

  return mscore;
}
exports.MConvert = MConvert;


function TEvent(t, ci, nn = null, st = null) {
  this.time = t;
  this.type = 'channel';
  this.channel = ci;
  this.subtype = st;
  this.noteNumber = nn;
}

TEvent.prototype.implement = function(pre) {
  this.deltaTime = this.time - pre.time;
}
TEvent.prototype.turnPlain = function() {

}

function MTConvert(mscore) {
  var ticksPerBeat = 480;
  var ttracks = [];
  for (var ti = 0, mtrk; mtrk = mscore._tracks[ti]; ++ti) {
    var ttrk = [], openChords = new Set(), tmpv;
    // ttrk.push(tmpv = new TEvent(0, 0, null, 'programChange'));
    // tmpv.programNumber = 40;
    for (var bi = 0, mb; mb = mtrk.bars[bi]; ++bi) {
      for (var ci = 0, mch; mch = mb.chords[ci]; ++ci) {
        // Convert MChord to TChord
        if (mch instanceof MChord) {
          if (openChords.has(mch)) continue;
          var start = mch.beat._start, end = start, gap = 15;
          if (mch._linkObject && mch._linkObject._same) {
            for (var li = 0, lo; lo = mch._linkObject._start[li]; ++li) {
              end += lo.beat.beatlen;
              openChords.add(lo);
            }
            openChords.add(mch._linkObject._end);
            end += mch._linkObject._end.beat.beatlen;
          } else {
            if (mch._linkObject && mch != mch._linkObject._end) {
              gap = 0;
            }
            end += mch.beat.beatlen;
          }

          for (var ni = 0, note; note = mch.notes[ni]; ++ni) {
            var on = new TEvent(ticksPerBeat * start, ti, note.pitch, 'noteOn');
            on.velocity = 90;
            ttrk.push(on);
            ttrk.push(new TEvent(ticksPerBeat * end - gap, ti, note.pitch, 'noteOff'));
          }
        }
      }
    }
    ttracks.push(ttrk);
    ttrk.sort(function(a, b) {return a.time - b.time;});
    ttrk[0].deltaTime = ttrk[0].time;
    for (var ei = 1, ent; ent = ttrk[ei]; ++ei) {
      ttrk[ei].implement(ttrk[ei-1]);
      ttrk[ei].turnPlain();
    }
  }

  console.log(ttracks);
  return {
    'header': {'ticksPerBeat': ticksPerBeat},
    'tracks': ttracks,
  };
}
exports.MTConvert = MTConvert;
