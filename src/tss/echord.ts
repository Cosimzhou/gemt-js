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
    var cbi = new EConjunctBeamInfo(this.id, phase);
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
  _budget(ctx, etrack: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    var chordWidth = 0,
      w = 0,
      maxLineOfNote = -100,
      minLineOfNote = 100,
      shiftX = 0;
    var need_Flag = false,
      epos = new EPositionInfo();
    var adjacent_shift = false,
      adjlast_shift = false,
      noteImg;
    var note_heads = [],
      adjnote_heads = [],
      adjnote_indices = [];
    epos.rect.clear();


    for (let e, ll = -100, i = 0; e = this.notes[i]; i++) {
      let enoteEpos = e._budget(ctx, etrack, x);
      let ew = e.width;
      if (ll + 0.5 == e.line) {
        enoteEpos.img._attach(noteImg, GStrokeConstraintType.ConstraintX, this.notes[i -
          1].width);
        enoteEpos.width += this.notes[i - 1].width;
        adjlast_shift = adjacent_shift = true;
        adjnote_heads.push(enoteEpos);
        adjnote_indices.push(i);
      } else {
        adjlast_shift = false;
        ll = e.line;
        note_heads.push(enoteEpos);
      }

      epos.rect.union(enoteEpos.rect);
      epos.pushOperations(...enoteEpos.operations);
      if (e.line > maxLineOfNote) maxLineOfNote = e.line;
      if (e.line < minLineOfNote) minLineOfNote = e.line;
      if (e.nth > 1) need_Flag = true;
      if (ew > w) w = ew;

      if (enoteEpos.width > chordWidth) chordWidth = enoteEpos.width;
      if (enoteEpos.shx && enoteEpos.shx.x > shiftX) shiftX = enoteEpos.shx.x;
      if (!noteImg && enoteEpos.img) noteImg = enoteEpos.img;
    }

    { // draw extra line
      // overlines
      for (let i = -1; i >= minLineOfNote; --i) {
        epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), w + 8)
          ._attach(noteImg, GStrokeConstraintType.ConstraintX, -4));
      }
      // underlines
      for (let i = 5; i <= maxLineOfNote; ++i) {
        epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), w + 8)
          ._attach(noteImg, GStrokeConstraintType.ConstraintX, -4));
      }
    }

    this.epos = epos;
    // is tadpo flag upwards
    var isUp = this.force ? this.force.up : (maxLineOfNote > 4 - minLineOfNote);
    if (need_Flag) {
      let stemX = x,
        stemEndY, y, stemNoteY, stemMinY, h;
      let maxYOfNote = etrack.translate(maxLineOfNote),
        minYOfNote = etrack.translate(minLineOfNote);
      let maxYOfStem = maxYOfNote + 3 * etrack.gap,
        minYOfStem = minYOfNote - 3 * etrack.gap;
      let midYOfTrack = etrack.translate(2),
        opl;
      if (isUp) {
        stemX -= 0.6;
        //if (adjacent_shift) {
        //    //stemX += w;
        //    for (var adjnote of adjnote_heads) {
        //        adjnote.pos.img.detach(1)._attach(noteImg, -w);//adjnote.pos.img.width());
        //    }
        //    for (var rnote of note_heads) {
        //        ctx.shift(rnote.pos.ops, w, 0);
        //    }
        //}
        stemX += w;
        stemMinY = y = midYOfTrack > minYOfStem ? minYOfStem : midYOfTrack;
        stemNoteY = maxYOfNote - 0.5, stemEndY = y;
        h = maxYOfNote - y;
      } else {
        stemX += 0.6;
        if (adjacent_shift) {
          //stemX += w;
          for (let adjnote of adjnote_heads) {
            adjnote.img.detach(1)._attach(noteImg, GStrokeConstraintType.ConstraintX, -
              w);
          }
          for (let rnote of note_heads) {
            ctx.shift(rnote.operations, w, 0);
          }
        }
        y = midYOfTrack < maxYOfStem ? maxYOfStem : midYOfTrack;
        stemNoteY = stemMinY = minYOfNote + 0.5, stemEndY = y;
        h = y - minYOfNote;
        // fix
      }
      epos.maxYOfNote = maxYOfNote;
      epos.minYOfNote = minYOfNote;

      // draw stem
      epos.rect.union(new GRect(w, h, x, stemMinY));
      epos.pushOperations(opl = ctx._Vline(stemX, stemNoteY, stemEndY));
      opl._attach(noteImg, GStrokeConstraintType.ConstraintX, stemX - x);

      if (this.nthBeat > 4) {
        if (this._beamCombine) { // draw beam
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
              if (isUp) {
                originCombo.epos._end.anchorOp.args[0] = opl.args[0] + ldy;
              } else {
                opl.args[0] = originCombo.epos._end.anchorOp.args[0] - ldy;
              }
              dy = -ldy;
            } else if (k > Math.PI / 12) {
              if (isUp) {
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
              let semy = sy,
                seMy = ey,
                dmargin = -Infinity;
              if (sy > ey) seMy = sy, semy = ey;
              if (isUp) {
                for (let diffm, i = 0; i < eoArr.length; ++i) {
                  diffm = seMy - eoArr[i].epos.minYOfNote;
                  if (diffm > dmargin) {
                    dmargin = diffm;
                  }
                }
                if (dmargin >= -5) {
                  if (dmargin <= 0)
                    dmargin = 2;
                  dmargin += 8;
                  sy -= dmargin;
                  ey -= dmargin;
                  originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
                }
              } else {
                for (let diffm, i = 0; i < eoArr.length; ++i) {
                  diffm = eoArr[i].epos.maxYOfNote - semy;
                  if (diffm > dmargin) {
                    dmargin = diffm;
                  }
                }
                if (dmargin >= -5) {
                  if (dmargin <= 0)
                    dmargin = 2;
                  dmargin += 8;
                  sy += dmargin;
                  ey += dmargin;
                  originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
                }
              }
            }
            if (originCombo._subBeamLayout) {
              // adjust the beam position for multi-beam
              let offy = originCombo._subBeamLayout.length * 3;
              if (isUp) {
                sy -= offy, ey -= offy;
              } else {
                sy += offy, ey += offy;
              }
              originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
            }

            // draw base beam of the combined chords
            let baseBeam = ctx._lineWh(0, sy, 0, ey, 3);
            baseBeam._attach(originCombo.epos._end.anchorOp,
              GStrokeConstraintType.ConstraintX)._attach(opl, GStrokeConstraintType
              .ConstraintX2);
            epos.pushOperations(baseBeam);
            epos.rects.push(new GRect(10, 10)._budget(x, stemMinY + (
              isUp ? 0 : h)));

            if (originCombo._eobjects[1]._mobj.nths.seq > 2) {
              let num = originCombo._eobjects[1]._mobj.nths.seq;
              epos.pushOperations(ctx._draw("num-" + num, 0, (sy + ey) / 2 + (
                isUp ? -15 : 6), 8, 12)._attach(baseBeam, GStrokeConstraintType
                .ConstraintXCenter));
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
                  let offy = isUp ? (i + 1) * 3 : 3 - 6 * (i + 1);
                  if (bms[cn] == bms[cn + 1]) {
                    // broken beam, which has an _end without setting up
                    if (bms[cn] == eoArr.length - 1) {
                      lvr2 = eoArr[bms[cn] - 1]._beamCombine._opl;
                      line2.x = (lvr1.x + lvr2.x) / 2;

                      line2._attach(lvr1, GStrokeConstraintType.ConstraintX2).
                      _attach(baseBeam, GStrokeConstraintType.ConstraintParallelHorizon,
                        offy);
                    } else {
                      lvr2 = eoArr[bms[cn] + 1]._beamCombine._opl;
                      line2.args[0] = (lvr1.x + lvr2.x) / 2;

                      line2._attach(lvr1, GStrokeConstraintType.ConstraintX).
                      _attach(baseBeam, GStrokeConstraintType.ConstraintParallelHorizon,
                        offy);
                    }
                  } else {
                    // set the beam two ends upon the anchor stem
                    line2._attach(lvr1, GStrokeConstraintType.ConstraintX).
                    _attach(lvr2, GStrokeConstraintType.ConstraintX2).
                    _attach(baseBeam, GStrokeConstraintType.ConstraintParallelHorizon,
                      offy);
                  }
                  epos.pushOperations(line2);
                }
              }
            }
          } else if (this._beamCombine._beamPhase == 0) {
            this._beamCombine._originBeamComb.epos = epos;
            epos._end = {
              anchorOp: opl
            };
          }
        } else { // draw flag
          let flag;
          if (isUp) {
            flag = ctx._draw("flagu-" + this.nthBeat, stemX, y);
            chordWidth += 5;
          } else {
            flag = ctx._draw("flagd-" + this.nthBeat, stemX, y);
          }
          flag._attach(opl, GStrokeConstraintType.ConstraintX);
          epos.pushOperations(flag);
        }
      }
    }

    epos.width = chordWidth;
    epos.rowIndex = ctx.rowIndex;
    epos.rowOriginPoint = ctx.rowOriginPoint;

    // budget over or under marks

    if (this.ouattach) {
      let overmarks = this.ouattach._overmarks;
      if (overmarks) {
        let l0y = etrack.translate(0);
        let ouy = noteImg.y;
        let omk, pmk = null;
        if (l0y > ouy) l0y = ouy;
        for (let oum of overmarks) {
          l0y -= 4;
          epos.pushOperations(omk = ctx._draw(oum, 0, l0y)
            ._attach(noteImg, GStrokeConstraintType.ConstraintXCenter)
            ._attach(pmk, GStrokeConstraintType.ConstraintTopOn, l0y));
          pmk = omk;
          l0y = 0;
        }
      }

      let oumark = this.ouattach._oumark;
      if (oumark) {
        if (isUp) {
          let l0y = etrack.translate(0);
          let ouy = noteImg.y;
          if (l0y > ouy) l0y = ouy;
          for (let oum of oumark) {
            l0y -= 16;
            epos.pushOperations(ctx._draw(oum, 0, l0y)
              ._attach(noteImg, GStrokeConstraintType.ConstraintXCenter));
          }
        } else {
          let l4y = etrack.translate(0);
          let ouy = noteImg.y;
          if (l4y < ouy) l4y = ouy;
          for (let oum of oumark) {
            l4y += 16;
            epos.pushOperations(ctx._draw(oum, 0, l4y)
              ._attach(noteImg, GStrokeConstraintType.ConstraintXCenter));
          }
        }
      }
    }

    // draw ties
    if (this._mobj instanceof MChord) {
      let linkObj = this._mobj._linkObject;
      if (linkObj && linkObj._end === this._mobj) {
        let arr = LinkTies(this, ctx, etrack.score.trackLength, isUp);
        return epos.pushOperations(...arr);
      }

      if (this.arpeggio) {
        //epos.pushOperations(ctx._draw("arpeggio", x, y));
      }
    }

    if (shiftX > 0) epos.shx = {
      x: shiftX
    };

    return epos;
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
}

function LinkTies(main, ctx: GContext, trackLength: number, isUp: boolean): Array<GStroke> {
  var epos = [];

  function _addCurve(epos1, epos2, isUp) {
    var curve, tadpo1 = epos1.operations[0],
      tadpo2 = epos2.operations[0];
    var interRowTies = epos1.rowIndex != epos2.rowIndex;
    if (interRowTies) {
      console.log("inter-row ties");
      var dummyTadpo: GPoint = new GPoint();
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

  let linkObj: MChordLinkInfo
  if (main._mobj instanceof MChord) {
    linkObj = main._mobj._linkObject;
  } else {
    console.error("unexpected link target", main._mobj);
  }

  var tadpo2 = linkObj._start[0]._eobj.epos,
    tadpo1;
  if (linkObj._start.length > 1) {
    for (var tadi = 1; tadi < linkObj._start.length; tadi++) {
      tadpo1 = tadpo2;
      tadpo2 = linkObj._start[tadi]._eobj.epos;
      _addCurve(tadpo1, tadpo2, isUp);
    }
  }
  tadpo1 = tadpo2;
  tadpo2 = linkObj._end._eobj.epos;
  _addCurve(tadpo1, tadpo2, isUp);
  return epos;
}

