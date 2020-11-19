/**************************************************************
 *
 * EConvert
 *
 *      The function converts M-layer expression into E-layer.
 *      In this function, some associate staff will inject into
 *      the M & E layer marks. For example,
 *      Insert _mobj into E-marks and _eobj into M-marks.
 *
 * Arguments:
 *      ms      MScore object
 *
 * Return:
 *      EScore object
 *
 * Notice:
 *      Because of the associate staff, m-score and e-score
 *      are associated in a same life-cycle. You can't destory
 *      m-score related staff before e-score is transformed
 *      into g-layer, otherwise, the transforming may encounter
 *      same mistake.
 *************************************************************/

function EConvert(ms) {
  var score = new EScore(ms._tracks.length);
  var last_bars = null;
  var openTies = {};
  function feed_bar(bars) {
    function pushSkip(b, n = 1) {
      var marks = score._tracks[b].marks;
      var lastmark = marks[marks.length-1];
      if (lastmark instanceof ESkip) {
        if (n > 0) lastmark._skipN++;
      } else {
        marks.push(new ESkip(n));
      }
    }
    var curnote = Array.from(bars, x=>0);
    var minBeat = 0;
    //var maxBeat = 0;

    {
      // check and draw clef & beat marks
      for (var i = 0; i < bars.length; ++i) {
          if (bars[i] == null) continue;
          if (!last_bars || !bars[i]._clef._equal(last_bars[i]._clef)) {
              var arr = bars[i]._clef._convertMark();
              score._tracks[i].clefMarks.push({marksIdx:score._tracks[i].marks.length, headerMarks:arr});
          }
          if ((i == 0) &&
              (!last_bars || !bars[i]._timeBeat._equal(last_bars[i]._timeBeat))) {
              var arr = bars[i]._timeBeat._convertMark();
              if (arr)
                score._tracks[i].beatMarks.push({marksIdx:score._tracks[i].marks.length, headerMarks:arr});
          }
      }
    }

    var openBeamCombine = {};
    for (var restbars = 1; restbars; ) {
      minBeat = Infinity;
      restbars = 0;
      // get the minimum _start beat chord, which will appear in
      // the most left place in the track.
      for (var ch, b = 0; b < bars.length; ++b) {
        if (bars[b] == null || null == (ch = bars[b].chords[curnote[b]])) continue;
        if (ch.beat._start < minBeat) {minBeat = ch.beat._start;}
        //if (ch.startBeat > maxBeat) {maxBeat = ch.startBeat;}
        restbars++;
      }

      for (var ch, b = 0; restbars && b < bars.length; ++b) {
        if (bars[b] == null) continue;
        ch = bars[b].chords[curnote[b]];
        if (ch == null) {
          pushSkip(b);
          continue;
        }

        if (ch.beat._start == minBeat) {
          //pushSkip(b, 0);
          var newobj =  ch._convertToE(bars[b]._clef);
          if (ch._beamCombine) {
            if (ch._beamCombine._beamPhase == 0) {
              // beam combining begin
              openBeamCombine[ch._beamCombine.id] = ch._beamCombine;
              ch._beamCombine._eobjects = [newobj];
              newobj._beamCombine = {_originBeamComb: ch._beamCombine, _beamPhase:0};
            } else if (ch._beamCombine._beamPhase == 1) {
              // beam combining middle
              var openobj = openBeamCombine[ch._beamCombine.id];
              openobj._eobjects.push(newobj);
              newobj._beamCombine = {_originBeamComb: openobj, _beamPhase:1};
            } else {
              // beam combining end
              // uniform the tail direction
              var upd = 0, openobj = openBeamCombine[ch._beamCombine.id];
              openobj._eobjects.push(newobj);
              newobj._beamCombine = {_originBeamComb: openobj, _beamPhase:2};
              delete openBeamCombine[ch._beamCombine.id];

              for (var e, i = 0; i < openobj._eobjects.length; ++i) {
                upd += openobj._eobjects[i]._upTailDegree();
              }

              for (var i = 0, up = upd > 0; i < openobj._eobjects.length; ++i) {
                openobj._eobjects[i].force = {up:up};
              }
            }
          }
          newobj._mobj = ch;
          ch._eobj = newobj;
          score._tracks[b].marks.push(newobj);
          curnote[b]++;
        } else if (ch.beat._start > minBeat) {
          pushSkip(b);
        } else {
          console.error("some beat argument maybe undefined", ch, minBeat);
          return;
        }
      }
    }
    { // add bar line
      var trk0Marks = score._tracks[0].marks;
      if (bars[0]._timeBeat._unlimited()) {
        trk0Marks.push(new EBarline(6));
      } else {
        if (trk0Marks.length == 0 || !(trk0Marks[trk0Marks.length-1] instanceof EBarline))
          trk0Marks.push(new EBarline(0));
      }
    }
  }

  for (var curbars, resttrack, ib = 0; 1; ++ib) {
    curbars = [];
    resttrack = 0;
    for (var t of ms._tracks) {
      curbars.push(t.bars[ib]);
      if (t.bars[ib] != null) {
        resttrack++;
      }
    }
    if (resttrack == 0) break;
    feed_bar(curbars);
    last_bars = curbars;
  }

  for (var t of score._tracks) {
    for (var n = 0, i = 0; i < t.marks.length; ++i) {
      if (t.marks[i]._skipN != 0) {
        t.marks[n++] = t.marks[i];
      }
    }
    t.marks = t.marks.slice(0, n);
  }

  { // auto append end line
    var terminalLine = score._tracks[0].marks[score._tracks[0].marks.length-1];
    if (terminalLine && terminalLine._barlineType == 0)
      terminalLine._barlineType = 1;
  }
  return score;
}

exports.EConvert = EConvert;

