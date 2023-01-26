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
 *      mscore      MScore object
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

function EConvert(mscore: MScore) {
  var score = new EScore(mscore._tracks.length);
  var last_bars = null;
  var openTies = {};

  score.mscore = mscore;
  mscore.makeRepeatCourse();

  function feed_bar(bars) {
    function pushSkip(b: number, n: number = 1) {
      let marks = score._tracks[b].marks;
      let lastmark = marks[marks.length - 1];
      if (lastmark instanceof ESkip) {
        if (n > 0) lastmark._skipN++;
      } else {
        marks.push(new ESkip(n));
      }
    }
    var curnote = Array.from(bars, x => 0);
    var minBeat = 0;

    {
      // check and draw clef & beat marks
      for (let i = 0; i < bars.length; ++i) {
        if (bars[i] == null) continue;
        if (!last_bars || !bars[i]._clef._equal(last_bars[i]._clef)) {
          let arr = bars[i]._clef._convertMark();
          score._tracks[i].clefMarks.push(new ETrackHeaderMark(score._tracks[i].marks.length, arr));
        }
        if ((i == 0) &&
          (!last_bars || !bars[i]._timeBeat._equal(last_bars[i]._timeBeat))) {
          let arr = bars[i]._timeBeat._convertMark();
          if (arr)
            score._tracks[i].beatMarks.push(new ETrackHeaderMark(score._tracks[i].marks.length, arr));
        }
      }
    }

    var openBeamCombine = new Map();
    for (var restbars = 1; restbars;) {
      minBeat = Infinity;
      restbars = 0;
      // get the minimum _start beat chord, which will appear in
      // the most left place in the track.
      for (let ch, b = 0; b < bars.length; ++b) {
        if (bars[b] == null || null == (ch = bars[b].chords[curnote[b]]))
          continue;
        if (ch.beat._start < minBeat) {
          minBeat = ch.beat._start;
        }
        //if (ch.startBeat > maxBeat) {maxBeat = ch.startBeat;}
        restbars++;
      }

      for (let ch, b = 0; restbars && b < bars.length; ++b) {
        if (bars[b] == null) continue;
        ch = bars[b].chords[curnote[b]];
        if (ch == null) {
          pushSkip(b);
        } else if (b == 0 && (ch instanceof MMark) && ch.kind == 'barline') {
          let newobj = ch._convertToE(bars[b]._clef);
          if (newobj instanceof EBarline) {
            newobj._mobj = ch;
            ch._eobj = newobj;
            score._tracks[b].marks.push(newobj);
            curnote[b]++;
          }
          // Break the loop, because barline will only appear in the first track.
          // It is unnecessary to check the following ones.
          break;
        } else if (ch.beat._start == minBeat) {
          // newobj: EChord or ERest
          // ch: MChord or MRest

          //pushSkip(b, 0);
          let newobj = ch._convertToE(bars[b]._clef);
          if (ch._beamCombine) {
            let chBeam = ch._beamCombine;
            if (chBeam._beamPhase == 0) {
              // beam combining begin
              openBeamCombine[chBeam.id] = chBeam;
              chBeam._eobjects = [newobj];
              newobj._beamCombine = chBeam.follow();
            } else if (chBeam._beamPhase == 1) {
              // beam combining middle
              let openobj = openBeamCombine[chBeam.id];
              openobj._eobjects.push(newobj);
              newobj._beamCombine = openobj.follow(1);
            } else {
              // beam combining end
              // uniform the flag direction
              let openobj = openBeamCombine[chBeam.id];
              openobj._eobjects.push(newobj);
              newobj._beamCombine = openobj.follow(2);
              openBeamCombine.delete[chBeam.id];

              let upd = 0;
              for (let e, i = 0; i < openobj._eobjects.length; ++i) {
                upd += openobj._eobjects[i]._upFlagDegree();
              }

              for (let i = 0, up = upd > 0; i < openobj._eobjects.length; ++i) {
                openobj._eobjects[i].force = {
                  up: up
                };
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
      let marks = score._tracks[0].marks;
      if (bars[0] && bars[0]._timeBeat._unlimited()) {
        marks.push(new EBarline(6));
      } else {
        if (marks.length == 0 || !(marks[marks.length - 1] instanceof EBarline))
          marks.push(new EBarline(0));
      }
    }
  }

  for (let curbars, resttrack, ib = 0; 1; ++ib) {
    curbars = [];
    resttrack = 0;
    for (let t of mscore._tracks) {
      curbars.push(t.bars[ib]);
      if (t.bars[ib] != null) {
        resttrack++;
      }
    }
    if (resttrack == 0) break;
    feed_bar(curbars);
    last_bars = curbars;
  }

  for (let t of score._tracks) {
    let n = 0;
    for (let i = 0; i < t.marks.length; ++i) {
      let mark = t.marks[i];
      if (mark instanceof ESkip && mark._skipN == 0) {
      } else
        t.marks[n++] = mark;

    }
    t.marks = t.marks.slice(0, n);
  }

  { // auto append end line
    let emarks = score._tracks[0].marks;
    let lastMark = emarks[emarks.length - 1];
    if (lastMark instanceof EBarline) {
      let terminalLine: EBarline = lastMark;
      if (terminalLine && terminalLine._barlineType == 0)
        terminalLine._barlineType = 1;
    }
  }

  return score;
}

