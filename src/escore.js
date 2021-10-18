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
  this._tracks = [];
  this.trkcombo = [];
  this.trackLength = g_option.trackWidth;
  for (var i = 0; i < trk_num; ++i) {
    this._tracks.push(new ETrack(this));
  }
  if (trk_num > 1) this.trkcombo.push([0, 1]);
}
exports.EScore = EScore;

/*******************************
 * budgetARow
 *
 * ctx:            GContext
 * x:              Number
 * y:              Number
 * noteProgress:   Array
 ******************************/
EScore.prototype.budgetARow = function(ctx, x, y, noteProgress) {
  ctx.rowOriginPoint = { x: x, y: y };

  var rowctx = new EScoreBudgetRowContext(this, ctx);
  rowctx._prepareBackgroundForARow(x, y);
  x = rowctx.trkOriginX;

  var EndFlag = false;

  rowctx._prevRowMark = this._prevRowMark;

  {
    var bakpg = null,
      me = this;
    // arrange the row
    var restTrackNum = me._tracks.length,
      nextVisualIndex = Array(restTrackNum).fill(0);
    var tailBarCompleted = false,
      firstBarInRow = true,
      beginAWholeBar = true,
      endAWholeBar = false;
    for (var maxWidth, visualIndex = 0, lineFresh = false; !lineFresh && (x <
        me.trackLength || !tailBarCompleted) &&
      restTrackNum > (maxWidth = 0); visualIndex++) {
      var columnStartPos = rowctx._postOps.length;
      if (beginAWholeBar) {
        x = rowctx._fillBarHeader(x, noteProgress, firstBarInRow);
      }

      // Start to arrange those notes in tracks
      for (var beatStartX = x, track, trackIndex = 0; track = me._tracks[
          trackIndex]; ++trackIndex) {
        if (visualIndex < nextVisualIndex[trackIndex]) {
          // Skip the unreached emarks; wait the progress.
          continue;
        }

        if (noteProgress[trackIndex] >= track.marks.length) {
          // Whether all emarks in this track are settled.
          // if so, eliminate _tracks.
          nextVisualIndex[trackIndex]++;
          restTrackNum--;
          endAWholeBar = false;
          continue;
        }

        var epos;
        // treat the emark in this track
        var m = track.marks[noteProgress[trackIndex]++];
        if (m instanceof ESkip) {
          nextVisualIndex[trackIndex] += m._skipN;
        } else if (m instanceof EBarline) {
          lineFresh = m._lineFresh;

          // Be careful; EBarline will not trigger nextVisualIndex
          // moving next.
          // nextVisualIndex[trackIndex]++;
          epos = m._budget(ctx, x, rowctx._tracksPosInfo);
          rowctx._postOps.push(...epos.operations);
          // At this visualIndex, there is only one EBarline. So
          // the width of EBarline is the maximum width.
          maxWidth = epos.width;

          if (x < me.trackLength) {
            bakpg = noteProgress.concat();
          } else {
            tailBarCompleted = true;
          }

          rowctx._recordBarSegment(tailBarCompleted);

          visualIndex--;
          endAWholeBar = beginAWholeBar = true;

          if (rowctx._beatPositions.length) {
            rowctx._beatPositions[rowctx._beatPositions.length - 1]._attach(
              m);
          }

          // EBarline only appears in the first track,
          break;
        } else {
          // m instanceof EChord or ERest
          nextVisualIndex[trackIndex]++;

          epos = m._budget(ctx, track, x);
          rowctx._postOps.push(...epos.operations);
          // In order to make sure that the notes or marks do not
          // conflict with each other, record all thier positions
          // and envelopes.
          rowctx._tracksPosInfo[trackIndex].ops.push(...epos.operations);

          // TODO: add beat offset to the third element
          if (rowctx._beatPositions.length == 0 || rowctx._beatPositions[
              rowctx._beatPositions.length - 1].x < x)
            rowctx._beatPositions.push(
              new GBeatInfo(x, ctx.rowBaselineY.length, m._mobj.beat._start));

          maxWidth = Math.max(
            maxWidth, epos.width - (epos.noMargin ? g_option.margin : 0));


          if (epos.shx) {
            // If these marks required to insert some symbols before themselves,
            // they are settled in the x coordinate, and context would shift
            // them by shx.x to the place offers space for their symbols. In
            // another way, the mark's budget will settle symbols in minus x,
            // and till the context shift, time line is clean.
            var shiftX = beatStartX + epos.shx.x - x;
            if (shiftX > 0) {
              ctx.shift(rowctx._postOps, shiftX, 0, columnStartPos);
              x = beatStartX + epos.shx.x;
            }
            // shift before
          }

          rowctx._tracksPosInfo[trackIndex].rec.union(epos.rect);
          for (var r of epos.rects) {
            rowctx._tracksPosInfo[trackIndex].rec.union(r);
            ctx._grid.put(r);
          }
          ctx._grid.put(epos.rect);

          if (m._linkObject) {}
        }
        endAWholeBar = false;
      }
      x += maxWidth + g_option.margin;

      firstBarInRow = false;
      if (!endAWholeBar) beginAWholeBar = false;
    }

    EndFlag = (restTrackNum == 0);

    if (bakpg) {
      bakpg.forEach(function(elem, idx) { noteProgress[idx] = elem; });
    }
  }

  rowctx._adjustMarginBetweenAdjacentTrack();
  rowctx._stretchOps(EndFlag);

  rowctx._joinOps();
  rowctx._adjustMarginBetweenAdjacentRow();

  rowctx._archive();

  return EndFlag ? null : ctx._grid.overall.bottom;
}

EScore.prototype.budget = function(ctx, x, y) {
  var prog = Array(this._tracks.length).fill(0);

  y += g_option.marginTitle;
  x += g_option.indentHeading;
  this.trackLength -= g_option.indentHeading;

  ctx.rowBaselineY = [y];
  ctx.rowIndex = 0;
  ctx.beatPositions = [];
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

  this.mscore._repeatCourse._expand(ctx.beatPositions);
  ctx._slicePages();
}

EScore.prototype.put = function(etrack, elem) {
  if (etrack < this._tracks.length) {
    this._tracks[etrack].append(elem);
  }
}


/********************************
 *
 *  EScoreBudgetRowContext
 *
 *  It holds the row budget info
 *
 *
 *******************************/
function EScoreBudgetRowContext(escore, gctx) {
  this._score = escore;
  this._gctx = gctx;
  this._currentBarTrialIndex = escore.currentBarIndex;
  this._beatPositions = [];
  this._preOps = [];
  this._postOps = [];
  this._barSegInfo = [
    {
      opsIdx: 0,
      beatIdx: 0,
      rectIdx: 0
    }
  ];
  this._tracksPosInfo = [];
  this._legacyMark = null;

  // Clear GContext
  gctx._grid.clear();
}

EScoreBudgetRowContext.prototype._archive = function() {
  var score = this._score;

  score.currentBarIndex = this._currentBarTrialIndex;

  var ctx = this._gctx;
  ctx.rowBaselineY.push(ctx._grid.overall.bottom);
  ctx._settle(this.finalOps);
  ctx.beatPositions.push(...this._beatPositions);

  score._prevRowMark = this._legacyMark;
}

EScoreBudgetRowContext.prototype._joinOps = function() {
  this.finalOps = this._preOps.concat(this._postOps);
}


EScoreBudgetRowContext.prototype._recordBarSegment = function(notFirst) {
  if (!notFirst) {
    this._barSegInfo.pop();
  }

  this._barSegInfo.push({
    opsIdx: this._postOps.length,
    beatIdx: this._beatPositions.length,
    rectIdx: this._gctx._grid.array.length
  });

  this._currentBarTrialIndex++;
}


EScoreBudgetRowContext.prototype._adjustMarginBetweenAdjacentTrack =
  function() {
    // Adjust margin between adjacent track.
    // move the under one lower
    var ctx = this._gctx;
    var trackShiftY = 0
    for (var diff, i = 1; i < this._tracksPosInfo.length; ++i) {
      diff = this._tracksPosInfo[i].rec.top - this._tracksPosInfo[i - 1]
        .rec.bottom;
      if (diff <= 0) {
        trackShiftY += g_option.gapMinBetweenRows - diff;
      }

      if (trackShiftY > 0) {
        this._tracksPosInfo[i].y += trackShiftY;
        this._tracksPosInfo[i].ey += trackShiftY;
        ctx.shift(this._tracksPosInfo[i].ops, 0, trackShiftY);
      }
    }

    if (trackShiftY > 0) {
      for (var op, i = 0; op = this._preOps[i]; i++) op._settle();
      ctx._grid.overall.bottom += trackShiftY;
    }
  }


EScoreBudgetRowContext.prototype._adjustMarginBetweenAdjacentRow = function() {
  // Avoid overlap between adjacent rows.
  // Whether this row risen to conflict with previous row.
  var ctx = this._gctx;
  var preY = ctx.rowBaselineY[ctx.rowBaselineY.length - 1];
  if (preY > ctx._grid.overall.top) {
    diff = preY - ctx._grid.overall.top + g_option.gapMinBetweenRows;
    ctx._grid.overall.bottom += diff;
    ctx.rowOriginPoint.y += diff;
    ctx.shift(this.finalOps, 0, diff);
    for (var rect of ctx._grid.array) {
      rect.shift(0, diff);
    }
  }
}

EScoreBudgetRowContext.prototype._prepareBackgroundForARow = function(ox, oy) {
  var score = this._score;
  var ctx = this._gctx;

  // Prepare track lines strokes for one row of _tracks.
  var x = ox + g_option.marginAhead;
  var y = oy;
  for (var etrack, i = 0; etrack = score._tracks[i]; ++i) {
    var cOps = etrack.preview(ctx, x, y);
    this._preOps.push(...cOps);
    this._tracksPosInfo.push({
      y: y,
      ey: y + 4 * g_option.gap,
      bl: cOps.baseLine,
      ops: cOps,
      rec: (new GRect()).clear()
    });
    y += 80;
  }

  var lastTrackInfo = this._tracksPosInfo[this._tracksPosInfo.length - 1];
  ctx._grid.overall.bottom = y = lastTrackInfo.ey;
  if (!g_option._openTrack) {
    // Draw the vertical closed line in the two ends of the row.
    this._preOps.push(ctx._Vline(x, oy, y)._attach(
      lastTrackInfo.bl, GStroke.Const.ConstraintY2));
    this._preOps.push(ctx._Vline(x + score.trackLength, oy, y)
      ._attach(lastTrackInfo.bl, GStroke.Const.ConstraintY2));
  }

  // draw bracket of _tracks
  for (var e, i = 0; e = score.trkcombo[i]; ++i) {
    this._preOps.push(ctx._draw(
      'brace', ox, this._tracksPosInfo[e[0]].y, 0,
      this._tracksPosInfo[e[1]].ey - this._tracksPosInfo[e[0]].y));
  }

  // Print No. for the first bar in score row.
  if (g_option.barNoShowAtRowHeading) {
    this._preOps.push(ctx._text(score.currentBarIndex + 1, x, oy));
  }


  this.trkOriginX = ox + g_option.marginAhead;
}


EScoreBudgetRowContext.prototype._stretchOps = function(endflag) {
  // Adjust should take out and append to makeplan.
  var score = this._score;
  var ctx = this._gctx;
  var arr = this._postOps;

  if (!endflag && this._barSegInfo.length > 1) {
    var barIdx = this._barSegInfo[0].opsIdx == 0 ? 1 : 0;
    var split = this._barSegInfo[barIdx];

    var lastOne = arr[arr.length - 1];
    var prevOne = arr[split.opsIdx - 1];
    // TODO: judge cut the last bar or not

    if (1) {
      // Cut the last bar to the next row
      this._postOps.splice(split.opsIdx);
      this._beatPositions.splice(split.beatIdx);
      ctx._grid.array.splice(split.rectIdx);

      this._currentBarTrialIndex--;
    }
  }

  if (arr.length) {
    for (var strk of arr) {
      strk._settle();
    }

    var lastOne = arr[arr.length - 1];
    if (lastOne.opt && lastOne.opt.cut) {
      arr.splice(arr.length - lastOne.opt.cut - 1);
      //arr.push(lastOne);

      this._legacyMark = lastOne.opt.eobj;
    }

    var tailGap = (lastOne.ext || 0);
    var ubound = lastOne.x - this.trkOriginX - tailGap;
    var rate = (score.trackLength - tailGap) / ubound;
    ctx._compress(arr, this.trkOriginX, rate);

    for (var bpo of this._beatPositions) {
      bpo.x = (bpo.x - this.trkOriginX) * rate + this.trkOriginX;
    }
  }
}


/********************************
 * _planEMarks
 *
 * Arguments:
 *     ctx
 *     x
 *     getArr  function object, which return
 *             EMark array in specified track
 *             index. EMarks only, such as
 *             clef, beat and so on.
 *******************************/
EScoreBudgetRowContext.prototype._planEMarks = function(ctx, x, getArr) {
  var score = this._score;

  for (var curTrack, i, maxWidth, rest_trk = score._tracks.length,
      cursor = score._tracks.map(x => 0); rest_trk;) {
    for (rest_trk = maxWidth = i = 0; curTrack = score._tracks[i]; ++i) {
      var arr = getArr(i);
      if (!arr || arr.length <= cursor[i]) continue;
      rest_trk++;

      var m = arr[cursor[i]++];
      var epos = m._budget(ctx, curTrack, x);
      this._postOps.push(...epos.operations);
      this._tracksPosInfo[i].ops.push(...epos.operations);
      ctx._grid.put(epos.rect);
      if (maxWidth < epos.width) maxWidth = epos.width;
    }
    x += maxWidth;
  }

  return x;
}



EScoreBudgetRowContext.prototype._fillBarHeader = function(x, noteProgress,
  firstBarInRow) {
  var score = this._score;
  var ctx = this._gctx;

  // We should check whether the clefs and time beats
  // are need to drawn. In case of the first bar in a row or
  // clefs or time beat changed, which should be drawn respect.
  var clefMarks = {},
    addBarHeadingStaff = 0;
  if (firstBarInRow) {
    // draw cleves in first bar.
    for (var track, obj, ni, i = 0; track = score._tracks[i]; ++i) {
      for (obj, ni = 1; obj = track.clefMarks[ni]; ni++) {
        if (obj.marksIdx > noteProgress[i]) {
          break;
        }
      }
      clefMarks[i] = track.clefMarks[ni - 1].headerMarks;
      addBarHeadingStaff++;
    }
  } else {
    // draw clefs and draw time beats when they are different from
    // the ones in previous bar.
    for (var track, obj, ni, i = 0; track = score._tracks[i]; ++i) {
      for (obj, ni = 1; obj = track.clefMarks[ni]; ni++) {
        if (obj.marksIdx == noteProgress[i]) {
          clefMarks[i] = track.clefMarks[ni].headerMarks;
          addBarHeadingStaff++;
          break;
        } else if (obj.marksIdx > noteProgress[i]) {
          break;
        }
      }
    }
  }

  if (addBarHeadingStaff) {
    x = this._planEMarks(ctx, x, i => clefMarks[i]);
  }

  // Prepare to draw beat marks.
  // Draw beat marks only when they are different from the ones
  // of previous bar, NOT every first bar in row.
  var beatMarks = [];
  for (var track, obj, ni = 0, track = score._tracks[0]; obj = track
    .beatMarks[ni]; ni++) {
    if (obj.marksIdx == noteProgress[0]) {
      beatMarks.push(track.beatMarks[ni].headerMarks);
      addBarHeadingStaff++;
      break;
    } else if (obj.marksIdx > noteProgress[0]) {
      break;
    }
  }

  if (beatMarks.length) {
    x = this._planEMarks(ctx, x, i => beatMarks);
  }

  if (addBarHeadingStaff) {
    x = this._planEMarks(ctx, x, i => [new EBlank()]);
  }

  if (this._prevRowMark) {
    // Be careful; EBarline will not trigger nextVisualIndex
    // moving next.
    // nextVisualIndex[trackIndex]++;
    var m = new EBarline(this._prevRowMark._barlineType);
    //
    m._barlineType = 3;

    var epos = m._budget(ctx, x, this._tracksPosInfo);
    this._postOps.push(...epos.operations);
    // At this visualIndex, there is only one EBarline. So
    // the width of EBarline is the maximum width.
    x += epos.width + g_option.margin;

    this._prevRowMark = null;
  }

  return x;
}
