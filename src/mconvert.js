

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
    mch.beat = new MTimeSlice(ch.beat, ch.startBeat);
    if (ch.beat == 0) {
      console.error('WTF!', ch, mch)
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
  obj.keySignature = obj['keySignature'];

  if (obj.timeSignature == null) {
    console.error('');
  }
  // console.log("mscore.timeSignature", obj.timeSignature);
  // console.log("mscore.keySignature", obj.keySignature);

  for (var t, it = 0; t = tmidi_convertor.tracks[it]; ++it) {
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
      clef = new MClef(mscore.tracks.length == 1 ? 1 : 0, tone);
    } else {
      var tone = new MTone(0);
      // TODO:
      clef = new MClef(mscore.tracks.length == 1 ? 1 : 0, tone);
    }

    mtrack.noteMax = t.noteHigh;
    mtrack.noteMin = t.noteLow;
    mtrack.append(mbar);
    mbar.timeBeat = mbeat;
    mbar.clef = clef;
    mbeat.set(timeSignatures.shift());
    // travel every chord in certain track
    for (var ch, ic = 0; ch = t.chords[ic];) {
      if (keySignatures && keySignatures.length &&
          curBeat > keySignatures[0].startBeat) {
        var tone = new MTone(0);
        tone.setKeySignature(keySignatures.shift().key);
        mbar.clef = new MClef(mscore.tracks.length == 1 ? 1 : 0, tone);
      }
      // timeSignatures deal
      if (timeSignatures[0] && curBeat > timeSignatures[0].startBeat) {
        mbar.timeBeat = new MBeat();
        mbar.timeBeat.set(timeSignatures.shift());
      }
      //
      if (curBeat < ch.startBeat) {
        var diffBeat = ch.startBeat - curBeat;
        //                var barCap = mbar.cap();
        //                if (barCap > 0 && barCap < diffBeat) {
        //
        //                }
        if ((mchord == null && diffBeat < 0.5) ||
            (mchord && diffBeat < mchord.beat.beatlen / 4)) {
          if (mchord) {
            // early close
            if (mbar.cap() >= diffBeat) {
              mchord.beat.addTo(diffBeat);
              mchord.dun = true;
              mchord.nths = mbar.timeBeat.nths(mchord.beat.beatlen);
              mbar.beat.addTo(diffBeat);
              curBeat = mchord.beat.endBeat();
            } else {
              var partBeat = mbar.cap();
              mchord.beat.addTo(partBeat);
              mchord.dun = true;
              mchord.nths = mbar.timeBeat.nths(mchord.beat.beatlen);
              mbar.beat.addTo(partBeat);

              diffBeat -= partBeat;
              var rest = new MRest();
              rest.beat = new MTimeSlice(diffBeat).follow(mchord.beat);
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
          rest.beat = new MTimeSlice(diffBeat, curBeat);
          mbar = mbar.feed(mtrack, rest);
          // mbar.clef = clef;
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
    mscore.tracks.push(mtrack);
  }


  for (var prebars, bars, rest_track, ib = 0;; ++ib) {
    bars = [];
    rest_track = 0;
    for (var b, it = 0; it < mscore.tracks.length; ++it) {
      bars.push(b = mscore.tracks[it].bars[ib]);
      if (b) {
        b.settle();
        rest_track++;
      }
    }
    if (rest_track == 0) break;

    // TODO : analysis
    prebars = bars;
  }

  return mscore;
} exports['MConvert'] = MConvert;

