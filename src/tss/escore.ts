/********************************
 *
 * EScore
 *      E层的谱
 * @constructor
 *
 * Args:
 *      trkNum     轨数
 *
 *******************************/

class EScore {
  _tracks: Array<ETrack>
  trkcombo: Array<any>
  trackLength: number
  _prevRowMark: EBarline
  currentBarIndex: number
  mscore: MScore

  constructor(trkNum: number = 2) {
    this._tracks = [];
    this.trkcombo = [];
    this.trackLength = g_option.trackWidth;
    for (var i = 0; i < trkNum; ++i) {
      this._tracks.push(new ETrack(this));
    }
    if (trkNum > 1) this.trkcombo.push([0, 1]);
  }

  /*******************************
   * budgetARow
   *
   * ctx:            GContext
   * x:              Number
   * y:              Number
   * noteProgress:   Array
   ******************************/
  budgetARow(ctx, x: number, y: number, noteProgress: Array<number>): number {
    ctx.rowOriginPoint = { x: x, y: y };
    let rowctx = new EScoreBudgetRowContext(this, ctx);
    rowctx._prepareBackgroundForARow(x, y);
    rowctx._prevRowMark = this._prevRowMark;
    x = rowctx.trkOriginX;

    // arrange the row
    for (let restTrackNum = this._tracks.length,
      nextVisualIndex = zarray(restTrackNum),
      tailBarCompleted = false,
      firstBarInRow = true,
      beginAWholeBar = true,
      endAWholeBar = false,
      visualIndex = 0, lineFresh = false, maxWidth;
      !lineFresh && (x < this.trackLength || !tailBarCompleted) && restTrackNum > (maxWidth = 0);
      visualIndex++) {
      let columnStartPos = rowctx._postOps.length;
      if (beginAWholeBar) {
        x = rowctx._fillBarHeader(x, noteProgress, firstBarInRow);
      }

      // Start to arrange those notes in tracks
      for (let beatStartX = x, track, trackIndex = 0; track = this._tracks[trackIndex]; ++trackIndex) {
        if (visualIndex < nextVisualIndex[trackIndex]) {
          // Skip the unreached emarks; wait the progress.
          continue;
        }

        if (noteProgress[trackIndex] >= track.marks.length) {
          // Whether all emarks in this track are settled.
          // if so, eliminate _tracks.
          nextVisualIndex[trackIndex]++;
          if (--restTrackNum === 0) {
            rowctx.endFlag = true;
          }
          endAWholeBar = false;
          continue;
        }

        let epos;
        // treat the emark in this track
        let m = track.marks[noteProgress[trackIndex]++];
        if (m instanceof ESkip) {
          nextVisualIndex[trackIndex] += m._skipN;
        } else if (m instanceof EBarline) {
          lineFresh = m._lineFresh;

          // Be careful; EBarline will not trigger nextVisualIndex
          // moving next.
          // nextVisualIndex[trackIndex]++;
          epos = m._budget(ctx, null, x, rowctx._tracksPosInfo);
          rowctx._postOps.push(...epos.operations);
          // At this visualIndex, there is only one EBarline. So
          // the width of EBarline is the maximum width.
          maxWidth = epos.width;

          if (x < this.trackLength) {
            rowctx._copyEtracksProgress(noteProgress);
          } else {
            tailBarCompleted = true;
            rowctx.hasConsective = false;
            for (let ti = 0; ti < noteProgress.length; ti++) {
              if (noteProgress[ti] < this._tracks[ti].marks.length) {
                rowctx.hasConsective = true;
                break;
              }
            }
          }

          rowctx._recordBarSegment(tailBarCompleted);

          visualIndex--;
          endAWholeBar = beginAWholeBar = true;

          if (rowctx._beatPositions.length) {
            rowctx._beatPositions[rowctx._beatPositions.length - 1]._attach(m);
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
          if (rowctx._beatPositions.length === 0 || rowctx._beatPositions[
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
            let shiftX = beatStartX + epos.shx.x - x;
            if (shiftX > 0) {
              ctx.shift(rowctx._postOps, shiftX, 0, columnStartPos);
              x = beatStartX + epos.shx.x;
            }
            // shift before
          }

          rowctx._tracksPosInfo[trackIndex].rec.union(epos.rect);
          for (let r of epos.rects) {
            rowctx._tracksPosInfo[trackIndex].rec.union(r);
            ctx._grid.put(r);
          }
          ctx._grid.put(epos.rect);

          //if (m._linkObject) {}
        }
        endAWholeBar = false;
      }
      x += maxWidth + g_option.margin;

      firstBarInRow = false;
      if (!endAWholeBar) beginAWholeBar = false;
    }
    //rowctx.endFlag = (restTrackNum == 0);

    rowctx._adjustMarginBetweenAdjacentTrack();
    rowctx._stretchOps(noteProgress);  // endflag effected here
    rowctx._joinOps();
    rowctx._adjustMarginBetweenAdjacentRow();
    rowctx._archive();

    return rowctx.endFlag? null: ctx._grid.overall.bottom;
  }

  budget(ctx, x: number, y: number): void {
    var prog = zarray(this._tracks.length);

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
      if (0 === ctx.rowIndex++) {
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

  put(etrack: number, elem: ELayoutBudget): void {
    if (etrack < this._tracks.length) {
      this._tracks[etrack].append(elem);
    }
  }
}

class EBarSequence {
  opsIdx: number
  beatIdx: number
  rectIdx: number
  constructor(o: number = 0, b: number = 0, r: number = 0) {
    this.opsIdx = o;
    this.beatIdx = b;
    this.rectIdx = r;
  }
}


class ETrackPositionInfo {
  y: number
  ey: number
  bl: GStroke           // the base line of this track
  ops: Array<GStroke>
  rec: GRect
  constructor(sy: number, ey: number, ops: Array<GStroke>) {
    this.y = sy;
    this.ey = ey;
    this.bl = ops[ops.length-1];
    this.ops = ops;
    this.rec = (new GRect()).clear();
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
class EScoreBudgetRowContext {
  _currentBarTrialIndex: number
  _score: EScore
  _gctx: GContext
  _beatPositions: Array<GBeatInfo>
  _preOps: Array<GStroke>
  _postOps: Array<GStroke>
  finalOps: Array<GStroke>
  _barSegInfo: Array<EBarSequence>

  psIdx: number
  eatIdx: number
  ectIdx: number
  trkOriginX: number
  _tracksPosInfo: Array<ETrackPositionInfo>
  _legacyMark: EBarline
  _prevRowMark: EBarline
  _etrackProgressCopy: Array<number>
  endFlag: boolean
  hasConsective: boolean

  constructor(escore: EScore, gctx: GContext) {
    this._score = escore;
    this._gctx = gctx;
    this._currentBarTrialIndex = escore.currentBarIndex;
    this._beatPositions = [];
    this._preOps = [];
    this._postOps = [];
    this._barSegInfo = [new EBarSequence()];
    this._tracksPosInfo = [];
    this._legacyMark = null;
    this.endFlag = false;
    this.hasConsective = true;

    // Clear GContext
    gctx._grid.clear();
  }

  _archive(): void {
    var score = this._score;

    score.currentBarIndex = this._currentBarTrialIndex;

    let ctx = this._gctx;
    ctx.rowBaselineY.push(ctx._grid.overall.bottom);
    ctx._settle(this.finalOps);
    ctx.beatPositions.push(...this._beatPositions);

    score._prevRowMark = this._legacyMark;
  }

  _joinOps(): void {
    this.finalOps = this._preOps.concat(this._postOps);
  }


  _recordBarSegment(notFirst: boolean): void {
    if (!notFirst) {
      this._barSegInfo.pop();
    }

    this._barSegInfo.push(new EBarSequence(this._postOps.length,
      this._beatPositions.length, this._gctx._grid.array.length));

    this._currentBarTrialIndex++;
  }


  _adjustMarginBetweenAdjacentTrack(): void {
    // Adjust margin between adjacent track.
    // move the under one lower
    var ctx = this._gctx;
    var trackShiftY = 0
    for (let i = 1; i < this._tracksPosInfo.length; ++i) {
      let diff = this._tracksPosInfo[i].rec.top - this._tracksPosInfo[i - 1]
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
      for (let op, i = 0; op = this._preOps[i]; i++) op._settle();
      ctx._grid.overall.bottom += trackShiftY;
    }
  }


  _adjustMarginBetweenAdjacentRow(): void {
    // Avoid overlap between adjacent rows.
    // Whether this row risen to conflict with previous row.
    var ctx = this._gctx;
    var preY = ctx.rowBaselineY[ctx.rowBaselineY.length - 1];
    if (preY > ctx._grid.overall.top) {
      let diff = preY - ctx._grid.overall.top + g_option.gapMinBetweenRows;
      ctx._grid.overall.bottom += diff;
      ctx.rowOriginPoint.y += diff;
      ctx.shift(this.finalOps, 0, diff);
      for (let rect of ctx._grid.array) {
        rect.shift(0, diff);
      }
    }
  }

  _prepareBackgroundForARow(ox: number, oy: number): void {
    var score = this._score;
    var ctx = this._gctx;

    // Prepare track lines strokes for one row of _tracks.
    var x = ox + g_option.marginAhead;
    var y = oy;
    for (let etrack, i = 0; etrack = score._tracks[i]; ++i) {
      let cOps = etrack.preview(ctx, x, y);
      this._preOps.push(...cOps);
      this._tracksPosInfo.push(new ETrackPositionInfo(y, y + 4 * g_option.gap, cOps));
      y += 80;
    }

    var lastTrackInfo = this._tracksPosInfo[this._tracksPosInfo.length - 1];
    ctx._grid.overall.bottom = y = lastTrackInfo.ey;
    if (!g_option._openTrack) {
      // Draw the vertical closed line in the two ends of the row.
      this._preOps.push(ctx._Vline(x, oy, y)._attach(
        lastTrackInfo.bl, GStrokeConstraintType.ConstraintY2));
      this._preOps.push(ctx._Vline(x + score.trackLength, oy, y)
        ._attach(lastTrackInfo.bl, GStrokeConstraintType.ConstraintY2));
    }

    // draw bracket of _tracks
    for (let e, i = 0; e = score.trkcombo[i]; ++i) {
      this._preOps.push(ctx._draw('brace', ox, this._tracksPosInfo[e[0]].y,
        0, this._tracksPosInfo[e[1]].ey - this._tracksPosInfo[e[0]].y));
    }

    // Print No. for the first bar in score row.
    if (g_option.barNoShowAtRowHeading) {
      this._preOps.push(ctx._text((score.currentBarIndex + 1).toString(), x, oy));
    }

    this.trkOriginX = ox + g_option.marginAhead;
  }

  _copyEtracksProgress(ps: Array<number>): void {
    this._etrackProgressCopy = ps.concat();
  }

  _stretchOps(ps: Array<number>): void {
    // Adjust should take out and append to makeplan.
    var score = this._score;
    var ctx = this._gctx;
    var arr = this._postOps;
    var noBarLeft = true;

    if (!this.endFlag && this._barSegInfo.length > 1) {
      let barIdx = this._barSegInfo[0].opsIdx === 0 ? 1 : 0;
      let split = this._barSegInfo[barIdx];

      let lastOne = arr[arr.length - 1];
      let prevOne = arr[split.opsIdx - 1];
      // TODO: judge cut the last bar or not

      // compact or not
      let postponeLastBar = !g_option.compactLayout;
      //if (this._gctx && this._gctx.rowIndex == xxx) {
      //  postponeLastBar = true;
      //}

      if (postponeLastBar) {
        // Cut the last bar to the next row
        this._postOps.splice(split.opsIdx);
        this._beatPositions.splice(split.beatIdx);
        ctx._grid.array.splice(split.rectIdx);

        this._currentBarTrialIndex--;

        if (this._etrackProgressCopy) {
          this._etrackProgressCopy.forEach(function(elem, idx) { ps[idx] = elem; });
        }
        noBarLeft = false;
      }
    }

    if (arr.length) {
      for (let strk of arr) {
        strk._settle();
      }

      let lastOne = arr[arr.length - 1];
      if (lastOne.opt && lastOne.opt.cut) {
        arr.splice(arr.length - lastOne.opt.cut - 1);
        //arr.push(lastOne);

        this._legacyMark = lastOne.opt.eobj;
      }

      let tailGap = (lastOne.ext || 0);
      let ubound = lastOne.x - this.trkOriginX - tailGap;
      let rate = (score.trackLength - tailGap) / ubound;
      ctx._compress(arr, this.trkOriginX, rate);

      for (let bpo of this._beatPositions) {
        bpo.x = (bpo.x - this.trkOriginX) * rate + this.trkOriginX;
      }
    }

    if (noBarLeft && !this.hasConsective) {
      this.endFlag = true;
    }

    if (this.endFlag) {
      let endBeat = Math.max(...this._score.mscore.tracks.map(function(x):number{return x.endBeat;}));
      let lastx = this._beatPositions.length? this._beatPositions[this._beatPositions.length-1].x: 0;
      this._beatPositions.push(new GBeatInfo(lastx, this._gctx.rowBaselineY.length, endBeat));
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
  _planEMarks(ctx, x, getArr) {
    var score = this._score;

    for (let curTrack, i, maxWidth, rest_trk = score._tracks.length,
        cursor = score._tracks.map(x => 0); rest_trk;) {
      for (rest_trk = maxWidth = i = 0; curTrack = score._tracks[i]; ++i) {
        let arr = getArr(i);
        if (!arr || arr.length <= cursor[i]) continue;
        rest_trk++;

        let m = arr[cursor[i]++];
        let epos = m._budget(ctx, curTrack, x);
        this._postOps.push(...epos.operations);
        this._tracksPosInfo[i].ops.push(...epos.operations);
        ctx._grid.put(epos.rect);
        if (maxWidth < epos.width) maxWidth = epos.width;
      }
      x += maxWidth;
    }

    return x;
  }

  _fillBarHeader(x: number, noteProgress: Array<number>, firstBarInRow: boolean): number {
    var score = this._score;
    var ctx = this._gctx;

    // We should check whether the clefs and time beats
    // are need to drawn. In case of the first bar in a row or
    // clefs or time beat changed, which should be drawn respect.
    var clefMarks = {},
      addBarHeadingStaff = 0;
    if (firstBarInRow) {
      // draw cleves in first bar.
      for (let track, i = 0, ni, obj; track = score._tracks[i]; ++i) {
        for (ni = 1; obj = track.clefMarks[ni]; ni++) {
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
      for (let track, i = 0; track = score._tracks[i]; ++i) {
        for (let obj, ni = 1; obj = track.clefMarks[ni]; ni++) {
          if (obj.marksIdx === noteProgress[i]) {
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
    for (let obj, ni = 0, track = score._tracks[0]; obj = track.beatMarks[ni]; ni++) {
      if (obj.marksIdx === noteProgress[0]) {
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
      let m = new EBarline(this._prevRowMark._barlineType);
      //
      m._barlineType = 3;

      let epos = m._budget(ctx, null, x, this._tracksPosInfo);
      this._postOps.push(...epos.operations);
      // At this visualIndex, there is only one EBarline. So
      // the width of EBarline is the maximum width.
      x += epos.width + g_option.margin;

      this._prevRowMark = null;
    }

    return x;
  }
}
