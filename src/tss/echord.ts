/********************************
 *
 * EChord
 *
 * @constructor
 *******************************/

class EConjunctBeamInfo {
  id: number
  _beamPhase: number //1,2,3
  _opl: GStroke

  _subBeamLayout: Array<Array<number>>
  _eobjects: Array<EChord>// {_mobj}
  epos: EPositionInfo

  _originBeamComb: EConjunctBeamInfo

  constructor(id: number, phase: number = 0) {
    this.id = id;
    this._beamPhase = phase;
  }

  follow(phase: number = 0): EConjunctBeamInfo {
    let cbi = new EConjunctBeamInfo(this.id, phase);
    cbi._originBeamComb = this;
    return cbi;
  }
}

class ENoteFlagDirection {
  up: boolean
  down: boolean
}

enum EChordDecorationType {
  Normal = 0,
  Arpeggio = 1,
  Acciaccatura = 2,
  Appoggatura = 3,
}

class EChordBudgetContext {
  chordWidth: number
  w: number
  incrh: number
  maxLineOfNote: number
  minLineOfNote: number
  shiftX: number
  needFlag: boolean
  isUp: boolean
  small: boolean
  epos: EPositionInfo
  adjacentShift: boolean
  adjlastShift: boolean
  noteImg: GStroke
  noteHeads: Array<any>
  adjnoteHeads: Array<any>
  adjnoteHndices: Array<any>

  constructor(c: EChord) {
    this.w = 0;
    this.shiftX = 0;
    this.chordWidth = 0;
    this.maxLineOfNote = -100;
    this.minLineOfNote = 100;
    this.isUp = false;
    this.needFlag = false;
    this.adjlastShift = false;
    this.adjacentShift = false;
    this.small = c.small;
    this.noteHeads = [];
    this.adjnoteHeads = [];
    this.adjnoteHndices = [];

    this.epos = new EPositionInfo();
    this.epos.rect.clear();

    c.epos = this.epos;
  }

  determineUpOrNot(force: ENoteFlagDirection): void {
    this.isUp = this.small || (force ? force.up : (this.maxLineOfNote > 4 - this.minLineOfNote));
  }
}

class EChord extends ELayerBase implements EBeamCombinable {
  nthBeat: number
  notes: Array<ENote>
  epos: EPositionInfo
  force: ENoteFlagDirection

  _decoration: EChordDecorationType

  _beamCombine: EConjunctBeamInfo

  constructor(...args: ENote[]) {
    super();
    this.nthBeat = 1;
    this.notes = [...args].sort(ENote.comparator);
    if (this.notes.length > 0) {
      this.nthBeat = this.notes[0].nth;
    }
  }

  get arpeggio(): boolean {return this._decoration === EChordDecorationType.Arpeggio; }
  set arpeggio(v: boolean) {
    if (v) {
      if (this._decoration !== EChordDecorationType.Arpeggio && this._decoration !== EChordDecorationType.Normal) {
        console.error("not allow to assign arpeggio to abnormal chord");
      }
      this._decoration = EChordDecorationType.Arpeggio;
    } else if (this._decoration === EChordDecorationType.Arpeggio) {
      this._decoration = EChordDecorationType.Normal;
    }
  }

  get small(): boolean{ return this._decoration > EChordDecorationType.Arpeggio; }

  _budget(ctx, etrack: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    let b = new EChordBudgetContext(this);

    this._budgetHeads(ctx, etrack, b, x);         // draw note heads
    this._budgetExtraLines(ctx, etrack, b, x);    // draw extra line
    b.determineUpOrNot(this.force);               // is tadpo flag upwards

    this._budgetFlags(ctx, etrack, b, x);

    b.epos.width = b.chordWidth;
    b.epos.rowIndex = ctx.rowIndex;
    b.epos.rowOriginPoint = ctx.rowOriginPoint;

    this._budgetOUAttachment(ctx, etrack, b);     // budget over or under marks
    this._budgetSlurTie(ctx, etrack, b);          // budget the slur or tie on the notes

    if (this.arpeggio) {
      //b.epos.pushOperations(ctx._draw("arpeggio", x, y));
    }

    if (b.shiftX > 0) b.epos.shx = {
      x: b.shiftX
    };

    return b.epos;
  }

  _budgetHeads(ctx, etrack: ETrack, b: EChordBudgetContext, x: number) {
    for (let e, ll = -100, i = 0; e = this.notes[i]; i++) {
      e.small = b.small;
      let enoteEpos = e._budget(ctx, etrack, x);
      let ew = e.width;
      if (ll + 0.5 == e.line) {
        let nwidth = this.notes[i-1].width;
        enoteEpos.img._attach(b.noteImg, GStrokeConstraintType.ConstraintX, nwidth);
        enoteEpos.width += nwidth;
        b.adjlastShift = b.adjacentShift = true;
        b.adjnoteHeads.push(enoteEpos);
        // adjnoteHndices.push(i);
      } else {
        ll = e.line;
        b.adjlastShift = false;
        b.noteHeads.push(enoteEpos);
      }

      b.epos.rect.union(enoteEpos.rect);
      b.epos.pushOperations(...enoteEpos.operations);
      if (e.line > b.maxLineOfNote) b.maxLineOfNote = e.line;
      if (e.line < b.minLineOfNote) b.minLineOfNote = e.line;
      if (e.nth > 1) b.needFlag = true;
      if (ew > b.w) b.w = ew;

      if (enoteEpos.width > b.chordWidth) b.chordWidth = enoteEpos.width;
      if (enoteEpos.shx && enoteEpos.shx.x > b.shiftX) b.shiftX = enoteEpos.shx.x;
      if (!b.noteImg && enoteEpos.img) b.noteImg = enoteEpos.img;
    }
  }

  _budgetFlags(ctx, etrack: ETrack, b: EChordBudgetContext, x: number) {
    if (!b.needFlag) return;
    let  stemEndY, y, stemNoteY, stemMinY, maxYOfStem, minYOfStem, opl;
    let stemX = x,
      maxYOfNote = etrack.translate(b.maxLineOfNote),
      minYOfNote = etrack.translate(b.minLineOfNote),
      midYOfTrack = etrack.translate(2);
    if (b.small) {
      maxYOfStem = maxYOfNote + 1.6 * etrack.gap,
      minYOfStem = minYOfNote - 1.6 * etrack.gap;
    } else {
      maxYOfStem = maxYOfNote + 3 * etrack.gap,
      minYOfStem = minYOfNote - 3 * etrack.gap;
    }

    if (b.isUp) {
      stemX -= 0.6;
      //if (b.adjacentShift) {
      //    //stemX += b.w;
      //    for (var adjnote of b.adjnoteHeads) {
      //        adjnote.pos.img.detach(1)._attach(noteImg, -b.w);//adjnote.pos.img.width());
      //    }
      //    for (var rnote of b.noteHeads) {
      //        ctx.shift(rnote.pos.ops, b.w, 0);
      //    }
      //}
      stemX += b.w;
      y = b.small? minYOfStem: Math.min(midYOfTrack, minYOfStem);
      stemNoteY = maxYOfNote - 0.5, stemMinY = stemEndY = y;
      b.incrh = maxYOfNote - y;
    } else {
      stemX += 0.6;
      if (b.adjacentShift) {
        //stemX += b.w;
        for (let adjnote of b.adjnoteHeads) {
          adjnote.img.detach(1)._attach(b.noteImg, GStrokeConstraintType.ConstraintX, -b.w);
        }
        for (let rnote of b.noteHeads) {
          ctx.shift(rnote.operations, b.w, 0);
        }
      }
      y = b.small? maxYOfStem: Math.max(midYOfTrack, maxYOfStem);
      stemNoteY = stemMinY = minYOfNote + 0.5, stemEndY = y;
      b.incrh = y - minYOfNote;
      // fix
    }
    b.epos.maxYOfNote = maxYOfNote;
    b.epos.minYOfNote = minYOfNote;

    // draw stem
    b.epos.rect.union(new GRect(b.w, b.incrh, x, stemMinY));
    b.epos.pushOperations(opl = ctx._Vline(stemX, stemNoteY, stemEndY));
    opl._attach(b.noteImg, GStrokeConstraintType.ConstraintX, stemX - x);

    if (this.nthBeat > 4) {
      if (this._beamCombine) { // draw beam
        this._budgetBeam(ctx, b, opl, x, y, stemMinY);
      } else { // draw flag
        let flag;
        let args = [,stemX, y];
        if (b.isUp) {
          args[0] = "flagu-" + this.nthBeat;
          b.chordWidth += 5;
        } else {
          args[0] = "flagd-" + this.nthBeat;
          if (b.small) {
            args[2]+=10;
          }
        }
        if (b.small) args.push(4, 10);
        flag = ctx._draw(...args);
        flag._attach(opl, GStrokeConstraintType.ConstraintX);
        b.epos.pushOperations(flag);
      }
    }
  }

  _budgetOUAttachment(ctx, etrack: ETrack, b: EChordBudgetContext) {
    if (this.ouattach) {
      let overmarks = this.ouattach._overmarks;
      if (overmarks) {
        let l0y = etrack.translate(0);
        let ouy = b.noteImg.y;
        let omk, pmk = null;
        if (l0y > ouy) l0y = ouy;
        for (let oum of overmarks) {
          l0y -= 4;
          b.epos.pushOperations(omk = ctx._draw(oum, 0, l0y)
            ._attach(b.noteImg, GStrokeConstraintType.ConstraintXCenter)
            ._attach(pmk, GStrokeConstraintType.ConstraintTopOn, l0y));
          pmk = omk;
          l0y = 0;
        }
      }

      let oumark = this.ouattach._oumark;
      if (oumark) {
        if (b.isUp) {
          let l0y = etrack.translate(0);
          let ouy = b.noteImg.y;
          if (l0y > ouy) l0y = ouy;
          for (let oum of oumark) {
            l0y -= 16;
            b.epos.pushOperations(ctx._draw(oum, 0, l0y)
              ._attach(b.noteImg, GStrokeConstraintType.ConstraintXCenter));
          }
        } else {
          let l4y = etrack.translate(0);
          let ouy = b.noteImg.y;
          if (l4y < ouy) l4y = ouy;
          for (let oum of oumark) {
            l4y += 16;
            b.epos.pushOperations(ctx._draw(oum, 0, l4y)
              ._attach(b.noteImg, GStrokeConstraintType.ConstraintXCenter));
          }
        }
      }
    }
  }

  _budgetExtraLines(ctx, etrack: ETrack, b: EChordBudgetContext, x: number) {
    // overlines
    for (let i = -1; i >= b.minLineOfNote; --i) {
      b.epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), b.w + 8)
        ._attach(b.noteImg, GStrokeConstraintType.ConstraintX, -4));
    }
    // underlines
    for (let i = 5; i <= b.maxLineOfNote; ++i) {
      b.epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), b.w + 8)
        ._attach(b.noteImg, GStrokeConstraintType.ConstraintX, -4));
    }
  }

  _budgetSlurTie(ctx, etrack: ETrack, b: EChordBudgetContext) {
    if (!(this._mobj instanceof MChord)) return;
    let linkObj = this._mobj._linkObject;
    if (linkObj && linkObj._end === this._mobj) {
      // draw ties
      let arr = this._linkTies(ctx, etrack.score.trackLength, b.isUp);
      b.epos.pushOperations(...arr);
    }
  }

  _budgetBeam(ctx, b: EChordBudgetContext, opl: GStroke, x: number, y: number, stemMinY: number) {
    // draw beam
    this._beamCombine._opl = opl;
    if (this._beamCombine._beamPhase == 2) {
      let originCombo = this._beamCombine._originBeamComb;
      let sx = originCombo.epos._end.anchorOp.x,
        dy = y - originCombo.epos._end.anchorOp.args[0],
        dx = opl.x - sx, // assert dx > 0
        ldy = dx * Math.tan(Math.PI / 12),
        k = Math.atan2(dy, dx);
      // Whether the slope is too sharp, if so, try to it.slope
      if (k < -Math.PI / 12) {
        if (b.isUp) {
          originCombo.epos._end.anchorOp.args[0] = opl.args[0] + ldy;
        } else {
          opl.args[0] = originCombo.epos._end.anchorOp.args[0] - ldy;
        }
        dy = -ldy;
      } else if (k > Math.PI / 12) {
        if (b.isUp) {
          opl.args[0] = originCombo.epos._end.anchorOp.args[0] + ldy;
        } else {
          originCombo.epos._end.anchorOp.args[0] = opl.args[0] - ldy;
        }
        dy = ldy;
      }

      let sy = originCombo.epos._end.anchorOp.args[0],
        ey = opl.args[0];
      let eoArr = originCombo._eobjects;

      {
        // avoid middle note crash with beam
        let seminy = sy,
          seMaxy = ey,
          dmargin = -Infinity;
        if (sy > ey) seMaxy = sy, seminy = ey;
        if (b.isUp) {
          for (let diffm, i = 0; i < eoArr.length; ++i) {
            diffm = seMaxy - eoArr[i].epos.minYOfNote;
            if (diffm > dmargin) { dmargin = diffm; }
          }
          if (dmargin >= -5) {
            if (dmargin <= 0) dmargin = 2;
            dmargin += 8;
            sy -= dmargin, ey -= dmargin;
            originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
          }
        } else {
          for (let diffm, i = 0; i < eoArr.length; ++i) {
            diffm = eoArr[i].epos.maxYOfNote - seminy;
            if (diffm > dmargin) { dmargin = diffm; }
          }
          if (dmargin >= -5) {
            if (dmargin <= 0) dmargin = 2;
            dmargin += 8;
            sy += dmargin, ey += dmargin;
            originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
          }
        }
      }
      if (originCombo._subBeamLayout) {
        // adjust the beam position for multi-beam
        let offy = originCombo._subBeamLayout.length * 3;
        if (b.isUp) offy = -offy;
        sy += offy, ey += offy;
        originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
      }

      // draw base beam of the combined chords
      let baseBeam = ctx._lineWh(0, sy, 0, ey, 3);
      baseBeam._attach(originCombo.epos._end.anchorOp,
        GStrokeConstraintType.ConstraintX)._attach(opl, GStrokeConstraintType
        .ConstraintX2);
      b.epos.pushOperations(baseBeam);
      b.epos.rects.push(new GRect(10, 10)._budget(x, stemMinY + (b.isUp ? 0 : b.incrh)));

      if (originCombo._eobjects[1]._mobj.nths.seq > 2) {
        let num = originCombo._eobjects[1]._mobj.nths.seq;
        b.epos.pushOperations(ctx._draw("num-" + num, 0, (sy + ey) / 2 + (
          b.isUp ? -15 : 6), 8, 12)._attach(baseBeam, GStrokeConstraintType.ConstraintXCenter));
      }

      // _linkObject stems middle note of to beam
      for (let i = 1; i < eoArr.length - 1; ++i) {
        let stem = eoArr[i]._beamCombine._opl;
        let lambda = (stem.x - sx) / dx;
        stem.args[0] = (1 - lambda) * sy + lambda * ey;
      }

      if (originCombo._subBeamLayout) {
        // draw beams stand for 16th, 32th and so on
        for (let bms, i = 0; bms = originCombo._subBeamLayout[i]; ++i) {
          for (let cn = 0; cn < bms.length; cn += 2) {
            let line2 = ctx._lineWh(0, 0, 0, 0, 3);
            let lvr1 = eoArr[bms[cn]]._beamCombine._opl;
            let lvr2 = eoArr[bms[cn + 1]]._beamCombine._opl;
            let offy = b.isUp ? (i + 1) * 3 : 3 - 6 * (i + 1);
            if (bms[cn] == bms[cn + 1]) {
              // broken beam, which has an _end without setting up
              if (bms[cn] == eoArr.length - 1) {
                lvr2 = eoArr[bms[cn] - 1]._beamCombine._opl;
                line2.x = (lvr1.x + lvr2.x) / 2;

                line2._attach(lvr1, GStrokeConstraintType.ConstraintX2).
                _attach(baseBeam, GStrokeConstraintType.ConstraintParallelHorizon, offy);
              } else {
                lvr2 = eoArr[bms[cn] + 1]._beamCombine._opl;
                line2.args[0] = (lvr1.x + lvr2.x) / 2;

                line2._attach(lvr1, GStrokeConstraintType.ConstraintX).
                _attach(baseBeam, GStrokeConstraintType.ConstraintParallelHorizon, offy);
              }
            } else {
              // set the beam two ends upon the anchor stem
              line2._attach(lvr1, GStrokeConstraintType.ConstraintX).
              _attach(lvr2, GStrokeConstraintType.ConstraintX2).
              _attach(baseBeam, GStrokeConstraintType.ConstraintParallelHorizon, offy);
            }
            b.epos.pushOperations(line2);
          }
        }
      }
    } else if (this._beamCombine._beamPhase == 0) {
      this._beamCombine._originBeamComb.epos = b.epos;
      b.epos._end = {
        anchorOp: opl
      };
    }
  }

  _upFlagDegree(): number {
    var Mdf = -100,
      mdf = 100;
    for (var e, i = 0; e = this.notes[i]; i++) {
      if (e.line > Mdf) Mdf = e.line;
      if (e.line < mdf) mdf = e.line;
    }

    return Mdf + mdf - 4;
  }

  _linkTies(ctx: GContext, trackLength: number, isUp: boolean): Array<GStroke> {
    let linkObj: MChordLinkInfo
    if (this._mobj instanceof MChord) {
      linkObj = this._mobj._linkObject;
    } else {
      console.error("unexpected link target", this._mobj);
    }

    let epos = [];
    let tadpo2 = linkObj._start[0]._eobj.epos,
      tadpo1, firstUp = false;
    if (linkObj._start[0]._eobj instanceof EChord && linkObj._start[0]._eobj.small) firstUp = true;
    if (linkObj._start.length > 1) {
      for (let tadi = 1; tadi < linkObj._start.length; tadi++) {
        tadpo1 = tadpo2;
        tadpo2 = linkObj._start[tadi]._eobj.epos;
        _addCurve(ctx, epos, tadpo1, tadpo2, trackLength, firstUp || isUp);
        firstUp = false;
      }
    }
    tadpo1 = tadpo2;
    tadpo2 = linkObj._end._eobj.epos;
    _addCurve(ctx, epos, tadpo1, tadpo2, trackLength, firstUp || isUp);
    return epos;
  }
}


function _addCurve(ctx: GContext, epos: Array<GStroke>, epos1: EPositionInfo, epos2: EPositionInfo, trackLength: number, isUp: boolean) {
  let tadpo1 = epos1.operations[0],
    tadpo2 = epos2.operations[0];
  let interRowTies = epos1.rowIndex != epos2.rowIndex;
  let curve;
  if (interRowTies) {
    console.log("inter-row ties");
    let dummyTadpo: GPoint = new GPoint();
    dummyTadpo.x = epos1.rowOriginPoint.x + trackLength + tadpo2.x - epos2
      .rowOriginPoint.x;
    dummyTadpo.y = epos1.rowOriginPoint.y + tadpo2.y - epos2.rowOriginPoint.y;

    if (isUp) {
      curve = ctx._curve(dummyTadpo.x, dummyTadpo.y + 8, tadpo1.x, tadpo1.y +
        8, 2)._attach(tadpo1, GStrokeConstraintType.ConstraintX2);
    } else {
      curve = ctx._curve(tadpo1.x, tadpo1.y - 6, dummyTadpo.x, dummyTadpo.y -
        6, 2).
      _attach(tadpo1, GStrokeConstraintType.ConstraintX);
    }
    epos.push(curve);

    dummyTadpo.x = epos2.rowOriginPoint.x - trackLength + tadpo1.x - epos1
      .rowOriginPoint.x;
    dummyTadpo.y = epos2.rowOriginPoint.y + tadpo1.y - epos1.rowOriginPoint.y;
    if (isUp) {
      curve = ctx._curve(tadpo2.x, tadpo2.y + 8, dummyTadpo.x, dummyTadpo.y +
        8, 2)._attach(tadpo2, GStrokeConstraintType.ConstraintX);
    } else {
      curve = ctx._curve(dummyTadpo.x, dummyTadpo.y - 6, tadpo2.x, tadpo2.y -
        6, 2)._attach(tadpo2, GStrokeConstraintType.ConstraintX2);
    }
    epos.push(curve);
  } else {
    if (isUp) {
      curve = ctx._curve(tadpo2.x, tadpo2.y + 8, tadpo1.x, tadpo1.y + 8, 2)
        ._attach(tadpo1, GStrokeConstraintType.ConstraintX2)
        ._attach(tadpo2, GStrokeConstraintType.ConstraintX);
    } else {
      curve = ctx._curve(tadpo1.x, tadpo1.y - 6, tadpo2.x, tadpo2.y - 6, 2)
        ._attach(tadpo1, GStrokeConstraintType.ConstraintX)
        ._attach(tadpo2, GStrokeConstraintType.ConstraintX2);
    }
    epos.push(curve);
  }
}
