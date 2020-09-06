/********************************
 *
 * EScore
 *      E层的谱
 * @constructor
 *
 * Args:
 *      trk_num     轨数
 *
 *******************************/

function EScore(trk_num = 2) {
  this.tracks = [];
  this.trkcombo = [];
  this.trackLength = g_option.trackWidth;
  for (var i = 0; i < trk_num; ++i) {
    this.tracks.push(new ETrack(this));
  }
  if (trk_num > 1) this.trkcombo.push([0, 1]);
}
exports['EScore'] = EScore;

EScore.prototype.budgetARow = function(ctx, x, y, noteProgress) {
  var ox = x, oy = y, currentBarTrialIndex = this.currentBarIndex;
  var trksYPoses = [], preOps = [], postOps = [];

  ctx._grid.clear();
  ctx.rowOriginPoint = {x: x, y: y};


  // Prepare track line strokes for one row of tracks.
  var trkOriginX = x = ox + g_option.marginAhead;
  for (var etrack, i = 0; etrack = this.tracks[i]; ++i) {
    var cOps = etrack.preview(ctx, x, y);
    preOps.push(...cOps);
    trksYPoses.push({
      y: y,
      ey: y + 4 * g_option.gap,
      bl: cOps.baseLine,
      ops: cOps,
      recs: [],
      rec: (new GRect()).clear()
    });
    y += 80;  // + trackMargins[i];
  }
  var lastTrackInfo = trksYPoses[trksYPoses.length - 1];
  y = lastTrackInfo.ey;
  // Draw the vertical closed line in the two ends of the row.
  preOps.push(ctx._Vline(x, oy, y).attach(
      lastTrackInfo.bl, 0, GStroke.Const.ConstraintY2));
  preOps.push(ctx._Vline(x + this.trackLength, oy, y)
                  .attach(lastTrackInfo.bl, 0, GStroke.Const.ConstraintY2));
  // Print No. for the first bar in this row.
  postOps.push(ctx._text(this.currentBarIndex + 1, trkOriginX, oy));
  ctx._grid.overall.bottom = y;


  /********************************
   *  planEMarks
   *
   * Arguments:
   *      getArr  function object, which return
   *              EMark array in specified track
   *              index. EMarks only, such as
   *              clef, beat and so on.
   *******************************/
  function planEMarks(getArr) {
    for (var curTrack, i, maxWidth, rest_trk = me.tracks.length,
                                    cursor = me.tracks.map(x => 0);
         rest_trk;) {
      for (rest_trk = maxWidth = i = 0; curTrack = me.tracks[i]; ++i) {
        var arr = getArr(i);
        if (!arr || arr.length <= cursor[i]) continue;
        rest_trk++;

        var m = arr[cursor[i]++];
        var epos = m.budget(ctx, curTrack, x);
        postOps.push(...epos.operations);
        trksYPoses[i].ops.push(...epos.operations);
        trksYPoses[i].recs.push(epos);
        ctx._grid.put(epos.rect);
        if (maxWidth < epos.width) maxWidth = epos.width;
      }
      x += maxWidth;
    }
    return x;
  }


  var EndFlag = false;
  {
    var bakpg = null, me = this;
    // arrange the row
    var restTrackNum = me.tracks.length,
        nextVisualIndex = noteProgress.map(x => 0);
    var tailBarCompleted = false, firstBarInRow = true, beginAWholeBar = true,
        endAWholeBar = false;
    var barSegInfo = [{opsIdx: 0, rectIdx: 0}];
    for (var maxWidth, visualIndex = 0;
         (x < me.trackLength || !tailBarCompleted) &&
         restTrackNum > (maxWidth = 0);
         visualIndex++) {
      var columnStartPos = postOps.length;
      if (beginAWholeBar) {
        // We should check whether the cleves and time beats
        // are need to drawn. In case of the first bar in a row or
        // cleves or time beat changed, which should be drawn respectly.
        var headerMarks = {}, addBarHeadingStaff = 0;
        if (firstBarInRow) {
          // draw cleves in first bar.
          for (var track, obj, ni, i = 0; track = me.tracks[i]; ++i) {
            for (obj, ni = 1; obj = track.clefMarks[ni]; ni++) {
              if (obj.marksIdx > noteProgress[i]) break;
            }
            headerMarks[i] = track.clefMarks[ni - 1].headerMarks;
            addBarHeadingStaff++;
          }
        } else {
          // draw cleves and draw time beats when they are different from
          // the ones in prevous bar.
          for (var track, obj, ni, i = 0; track = me.tracks[i]; ++i) {
            for (obj, ni = 1; obj = track.clefMarks[ni]; ni++) {
              if (obj.marksIdx == noteProgress[i]) {
                headerMarks[i] = track.clefMarks[ni].headerMarks;
                addBarHeadingStaff++;
                break;
              } else if (obj.marksIdx > noteProgress[i]) {
                break;
              }
            }
          }
        }

        if (addBarHeadingStaff) x = planEMarks(i => headerMarks[i]);

        // Prepare to draw beat marks.
        // Draw beat marks only when they are different from the ones
        // of prevous bar, NOT every first bar in row.
        var beatMarks = [];
        for (var track, obj, ni = 0, track = me.tracks[0];
             obj = track.beatMarks[ni]; ni++) {
          if (obj.marksIdx == noteProgress[0]) {
            beatMarks.push(track.beatMarks[ni].headerMarks);
            addBarHeadingStaff++;
            break;
          } else if (obj.marksIdx > noteProgress[0]) {
            break;
          }
        }
        if (beatMarks.length) x = planEMarks(i => beatMarks);

        if (addBarHeadingStaff) x = planEMarks(i => [new EBlank()]);
      }

      for (var beatStartX = x, track, trackIndex = 0;
           track = me.tracks[trackIndex]; ++trackIndex) {
        if (visualIndex < nextVisualIndex[trackIndex])
          // Skip the unreached emarks; wait the progress.
          continue;

        if (noteProgress[trackIndex] >= track.marks.length) {
          // Whether all emarks in this track are settled.
          // if so, eliminate tracks.
          nextVisualIndex[trackIndex]++;
          restTrackNum--;
          endAWholeBar = false;
          continue;
        }

        var epos;
        // treat the emark in this track
        var m = track.marks[noteProgress[trackIndex]++];
        if (m instanceof ESkip) {
          nextVisualIndex[trackIndex] += m.skipn;
        } else if (m instanceof EBarline) {
          // Be careful; EBarline will not trigger nextVisualIndex
          // moving next.
          // nextVisualIndex[trackIndex]++;
          epos = m.budget(ctx, x, trksYPoses);
          postOps.push(...epos.operations);
          // At this visualIndex, there is only one EBarline. So
          // the width of EBarline is the maximum width.
          maxWidth = epos.width + 4;

          if (x < me.trackLength) {
            bakpg = noteProgress.concat();
            barSegInfo[0].opsIdx = postOps.length;
            barSegInfo[0].rectIdx = ctx._grid.array.length;
          } else {
            tailBarCompleted = true;
            barSegInfo.push(
                {opsIdx: postOps.length, rectIdx: ctx._grid.array.length});
          }

          visualIndex--;
          endAWholeBar = beginAWholeBar = true;
          currentBarTrialIndex++;

          // EBarline only appears in the first track,
          break;
        } else {
          nextVisualIndex[trackIndex]++;

          epos = m.budget(ctx, track, x);
          postOps.push(...epos.operations);

          maxWidth = Math.max(
              maxWidth, epos.width - (epos.noMargin ? g_option.margin : 0));

          // In order to make sure that the notes or marks do not
          // conflict with each other, record all thier positions
          // and envelopes.
          trksYPoses[trackIndex].ops.push(...epos.operations);
          trksYPoses[trackIndex].recs.push(epos);

          if (epos.shx) {
            // If these marks required to insert some symbols before themselves,
            // they are settled in the x coordinate, and context would shift
            // them by shx.x to the place offers space for their symbols. In
            // another way, the mark's budget will settle symbols in minus x,
            // and till the context shift, time line is clean.
            if (beatStartX > x - epos.shx.x) {
              ctx.shift(
                  postOps, epos.shx.x - (x - beatStartX), 0, columnStartPos);
              x = beatStartX + epos.shx.x;
            }
            // shift befores
          }

          trksYPoses[trackIndex].rec.union(epos.rect);
          ctx._grid.put(epos.rect);
          if (m.link) {
          }
        }
        endAWholeBar = false;
      }
      x += maxWidth + g_option.margin;

      firstBarInRow = false;
      if (!endAWholeBar) beginAWholeBar = false;
    }

    {
      // Adjust margin between adjacent track.
      // move the under one lower
      var trackShiftY = 0
      for (var diff, i = 1; i < trksYPoses.length; ++i) {
        diff = trksYPoses[i].rec.top - trksYPoses[i - 1].rec.bottom;
        if (diff <= 0) {
          trackShiftY += g_option.gapMinBetweenRows - diff;
        }

        if (trackShiftY > 0) {
          trksYPoses[i].y += trackShiftY;
          trksYPoses[i].ey += trackShiftY;
          ctx.shift(trksYPoses[i].ops, 0, trackShiftY);
          trksYPoses[i].recs.forEach(function(x) {
            x.top += trackShiftY, x.bottom += trackShiftY;
          });
        }
      }
      if (trackShiftY > 0) {
        for (var op, i = 0; op = preOps[i]; i++) op.settle();
        ctx._grid.overall.bottom += trackShiftY;
      }
    }


    {
      // Adjust should take out and append to makeplan.
      var arr = postOps;
      if (barSegInfo.length > 1) {
        var barIdx = barSegInfo[0].opsIdx == 0 ? 1 : 0;
        arr = postOps.slice(0, barSegInfo[barIdx].opsIdx);
        ctx._grid.array = ctx._grid.array.slice(0, barSegInfo[barIdx].rectIdx);
      } else {
        EndFlag = true;
      }

      EndFlag = restTrackNum == 0;
      var lastOne = arr[arr.length - 1], tailGap = (lastOne.ext || 0);
      var ubound = lastOne.x - trkOriginX - tailGap;
      ctx.compress(arr, trkOriginX, me.trackLength - tailGap, ubound);
      postOps = arr;

      currentBarTrialIndex--;
    }

    if (bakpg) {
      for (var i in bakpg) noteProgress[i] = bakpg[i];
    }
  }


  // draw bracket of tracks
  for (var e, i = 0; e = this.trkcombo[i]; ++i) {
    preOps.push(ctx._draw(
        'brace', ox, trksYPoses[e[0]].y, 0,
        trksYPoses[e[1]].ey - trksYPoses[e[0]].y));
  }

  var finalOps = preOps.concat(postOps);
  this.currentBarIndex = currentBarTrialIndex;
  {
    // Avoid overlap between adjacent rows.
    // Whether this row rised to conflict with prevous row.
    var preY = ctx.rowBaselineY[ctx.rowBaselineY.length - 1];
    if (preY > ctx._grid.overall.top) {
      diff = preY - ctx._grid.overall.top + g_option.gapMinBetweenRows;
      ctx._grid.overall.bottom += diff;
      ctx.rowOriginPoint.y += diff;
      ctx.shift(finalOps, 0, diff);
      for (var rect of ctx._grid.array) {
        rect.shift(0, diff);
      }
    }
  }
  ctx.rowBaselineY.push(ctx._grid.overall.bottom);
  ctx.settle(finalOps);

  return EndFlag ? null : ctx._grid.overall.bottom;
}

EScore.prototype['budget'] = function(ctx, x, y) {
  var prog = this.tracks.map(x => 0);

  y += g_option.marginTitle;
  x += g_option.indentHeading;
  this.trackLength -= g_option.indentHeading;

  ctx.rowBaselineY = [y];
  ctx.rowIndex = 0;
  this.currentBarIndex = 0;
  do {
    y = this.budgetARow(ctx, x, y, prog);
    ctx.debug();
    if (0 == ctx.rowIndex++) {
      // first row
      x -= g_option.indentHeading;
      this.trackLength += g_option.indentHeading;
    }

    if (y == null) break;
    y += g_option.gapBetweenRows;
  } while (true);

  ctx.slicePages();
}

EScore.prototype.put = function(etrack, elem) {
  if (etrack < this.tracks.length) {
    this.tracks[etrack].append(elem);
  }
}

