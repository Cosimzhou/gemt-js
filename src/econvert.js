/**************************************************************
 *
 * EConvert
 *
 *      The function converts M-layer expression into E-layer.
 *      In this function, some associate staff will inject into
 *      the M & E layer marks. For example,
 *      Insert mobj into E-marks and eobj into M-marks.
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
function EConvert(ms){
  var score = new EScore(ms.tracks.length);
  var last_bars = null;
  var openTies = {};
  function feed_bar(bars) {
    function pushSkip(b, n = 1) {
      var marks = score.tracks[b].marks;
      var lastmark = marks[marks.length-1];
      if (lastmark instanceof ESkip) {
        if (n > 0) lastmark.skipn++;
      } else {
        marks.push(new ESkip(n));
      }
    }
    var curnote = Array.from(bars, x=>0);
    var minBeat = 0;
    //var maxBeat = 0;

    {
      // check and draw celf & beat marks
      for (var i = 0; i < bars.length; ++i) {
          if (bars[i] == null) continue;
          if (!last_bars || !bars[i].clef.equal(last_bars[i].clef)) {
              var arr = bars[i].clef.convertMark();
              score.tracks[i].clefMarks.push({marksIdx:score.tracks[i].marks.length, headerMarks:arr});
          }
          if (i == 0)
          if (!last_bars || !bars[i].timeBeat.equal(last_bars[i].timeBeat)) {
              var arr = bars[i].timeBeat.convertMark();
              score.tracks[i].beatMarks.push({marksIdx:score.tracks[i].marks.length, headerMarks:arr});
          }
      }
    }

    var openBeamCombine = {};
    for (var restbars = 1; restbars; ) {
      minBeat = Infinity;
      restbars = 0;
      // get the minimum start beat chord, which will appear in
      // the most left place in the track.
      for (var ch, b = 0; b < bars.length; ++b) {
        if (bars[b] == null || null == (ch = bars[b].chords[curnote[b]])) continue;
        if (ch.beat.start < minBeat) {minBeat = ch.beat.start;}
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

        if (ch.beat.start == minBeat) {
          //pushSkip(b, 0);
          var newobj;
          if (ch instanceof MMark) {
            switch(ch.kind) {
              case 'barline':
                newobj = new EBarline(ch.type);
                break;
              case 'rest':
                newobj = new ERest(-ch.type);
                break;
              default:
                newobj = new EMark(ch.kind, -1.5);
                break;
            }

          } else if (ch instanceof MChord) {
            newobj = new EChord(...Array.from(ch.notes, n=>new ENote(ch.nths, ...bars[b].clef.noteLine(n.pitch))));
            if (ch.beamComb) {
              if (ch.beamComb.beamPhase == 0) {
                // beam combining begin
                openBeamCombine[ch.beamComb.id] = ch.beamComb;
                ch.beamComb.eo = [newobj];
                newobj.beamComb = {originBeamComb: ch.beamComb, beamPhase:0};
              } else if (ch.beamComb.beamPhase == 1) {
                // beam combining middle
                var openobj = openBeamCombine[ch.beamComb.id];
                openobj.eo.push(newobj);
                newobj.beamComb = {originBeamComb: openobj, beamPhase:1};
              } else {
                // beam combining end
                // uniform the tail direction
                var upd = 0, openobj = openBeamCombine[ch.beamComb.id];
                openobj.eo.push(newobj);
                newobj.beamComb = {originBeamComb: openobj, beamPhase:2};
                delete openBeamCombine[ch.beamComb.id];

                for (var e, i = 0; i < openobj.eo.length; ++i) {
                  upd += openobj.eo[i].upTailDegree();
                }

                for (var i = 0, up = upd > 0; i < openobj.eo.length; ++i) {
                  openobj.eo[i].force = {up:up};
                }
              }
            }
          } else if (ch instanceof MRest) {
              newobj = new ERest(ch.nths[0]);
          } else {
              console.error("object should be MMark, MRest or MChord", ch);
              return
          }
          newobj.mobj = ch;
          ch.eobj = newobj;
          score.tracks[b].marks.push(newobj);
          curnote[b]++;
        } else if (ch.beat.start > minBeat) {
            pushSkip(b);
        } else {
            console.error("some beat argument maybe undefined", ch, minBeat);
            return
        }
      }
    }
    { // add bar line
      var trk0Marks = score.tracks[0].marks;
      if (trk0Marks.length == 0 || !(trk0Marks[trk0Marks.length-1] instanceof EBarline))
        trk0Marks.push(new EBarline(0));
    }
  }

  for (var curbars, resttrack, ib = 0; 1; ++ib) {
    curbars = [];
    resttrack = 0;
    for (var t of ms.tracks) {
      curbars.push(t.bars[ib]);
      if (t.bars[ib] != null) {
        resttrack++;
      }
    }
    if (resttrack == 0) break;
    feed_bar(curbars);
    last_bars = curbars;
  }

  for (var t of score.tracks) {
    for (var n = 0, i = 0; i < t.marks.length; ++i) {
      if (t.marks[i].skipn != 0) {
        t.marks[n++] = t.marks[i];
      }
    }
    t.marks = t.marks.slice(0, n);
  }

  { // auto append end line
    var terminalLine = score.tracks[0].marks[score.tracks[0].marks.length-1];
    if (terminalLine.barlineType == 0)
      terminalLine.barlineType = 1;
  }
  return score;
}
exports['EConvert'] = EConvert;

