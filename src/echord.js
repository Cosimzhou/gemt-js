/********************************
 *
 * EChord
 *
 * @constructor
 *******************************/
function EChord() {
  this.nthBeat = 1;
  this.notes = [...arguments].sort(function(a, b) {
    return a.line - b.line
  });
  if (this.notes.length > 0) {
    this.nthBeat = this.notes[0].nth;
  }
}
exports.EChord = EChord;
impl(EChord, EScoreElement);

EChord.prototype._budget = function(ctx, etrack, x) {
  var chordWidth = 0,
    w = 0,
    maxLineOfNote = -100,
    minLineOfNote = 100,
    shiftX = 0;
  var need_tail = false,
    epos = new EPositionInfo();
  var adjacent_shift = false,
    adjlast_shift = false,
    noteImg;
  var note_heads = [],
    adjnote_heads = [],
    adjnote_indices = [];
  epos.rect.clear();


  for (var e, ll = -100, i = 0; e = this.notes[i]; i++) {
    var enoteEpos = e._budget(ctx, etrack, x);
    var ew = e.width();
    if (ll + 0.5 == e.line) {
      enoteEpos.img._attach(noteImg, GStroke.Const.ConstraintX, this.notes[i -
        1].width());
      enoteEpos.width += this.notes[i - 1].width();
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
    if (e.nth > 1) need_tail = true;
    if (ew > w) w = ew;

    if (enoteEpos.width > chordWidth) chordWidth = enoteEpos.width;
    if (enoteEpos.shx && enoteEpos.shx.x > shiftX) shiftX = enoteEpos.shx.x;
    if (!noteImg && enoteEpos.img) noteImg = enoteEpos.img;
  }

  { // draw extra line
    // overlines
    for (var i = -1; i >= minLineOfNote; --i) {
      epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), w + 8)
        ._attach(noteImg, GStroke.Const.ConstraintX, -4));
    }
    // underlines
    for (var i = 5; i <= maxLineOfNote; ++i) {
      epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), w + 8)
        ._attach(noteImg, GStroke.Const.ConstraintX, -4));
    }
  }

  this.epos = epos;
  var isUp = this.force ? this.force.up : (maxLineOfNote > 4 - minLineOfNote);
  if (need_tail) {
    var leverX = x,
      leverEndY, y, leverNoteY, leverMinY, h;
    var maxYOfNote = etrack.translate(maxLineOfNote),
      minYOfNote = etrack.translate(minLineOfNote);
    var maxYOfLever = maxYOfNote + 3 * etrack.gap,
      minYOfLever = minYOfNote - 3 * etrack.gap;
    var midYOfTrack = etrack.translate(2),
      opl;
    if (isUp) {
      leverX -= 0.2;
      //if (adjacent_shift) {
      //    //leverX += w;
      //    for (var adjnote of adjnote_heads) {
      //        adjnote.pos.img.detach(1)._attach(noteImg, -w);//adjnote.pos.img.width());
      //    }
      //    for (var rnote of note_heads) {
      //        ctx.shift(rnote.pos.ops, w, 0);
      //    }
      //}
      leverX += w;
      leverMinY = y = midYOfTrack > minYOfLever ? minYOfLever : midYOfTrack;
      leverNoteY = maxYOfNote, leverEndY = y;
      h = maxYOfNote - y;
    } else {
      leverX += 0.7;
      if (adjacent_shift) {
        //leverX += w;
        for (var adjnote of adjnote_heads) {
          adjnote.img.detach(1)._attach(noteImg, GStroke.Const.ConstraintX, -
            w);
        }
        for (var rnote of note_heads) {
          ctx.shift(rnote.operations, w, 0);
        }
      }
      y = midYOfTrack < maxYOfLever ? maxYOfLever : midYOfTrack;
      leverNoteY = leverMinY = minYOfNote, leverEndY = y;
      h = y - minYOfNote;
      // fix
    }
    epos.maxYOfNote = maxYOfNote;
    epos.minYOfNote = minYOfNote;

    // draw lever
    epos.rect.union(new GRect(w, h, x, leverMinY));
    epos.pushOperations(opl = ctx._Vline(leverX, leverNoteY, leverEndY));
    opl._attach(noteImg, GStroke.Const.ConstraintX, leverX - x);

    if (this.nthBeat > 4) {
      if (this._beamCombine) { // draw beam
        this._beamCombine._opl = opl;
        if (this._beamCombine._beamPhase == 2) {
          var originCombo = this._beamCombine._originBeamComb;
          var sx = originCombo.epos._end.anchorOp.x,
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

          var sy = originCombo.epos._end.anchorOp.args[0],
            ey = opl.args[0];
          var eoArr = originCombo._eobjects;

          {
            // avoid middle note crash with beam
            var semy = sy,
              seMy = ey,
              dmargin = -Infinity;
            if (sy > ey) seMy = sy, semy = ey;
            if (isUp) {
              for (var diffm, i = 0; i < eoArr.length; ++i) {
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
              for (var diffm, i = 0; i < eoArr.length; ++i) {
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
            var offy = originCombo._subBeamLayout.length * 3;
            if (isUp) {
              sy -= offy, ey -= offy;
            } else {
              sy += offy, ey += offy;
            }
            originCombo.epos._end.anchorOp.args[0] = sy, opl.args[0] = ey;
          }

          // draw base beam of the combined chords
          var baseBeam = ctx._lineWh(0, sy, 0, ey, 3);
          baseBeam._attach(originCombo.epos._end.anchorOp,
            GStroke.Const.ConstraintX)._attach(opl, GStroke.Const
            .ConstraintX2);
          epos.pushOperations(baseBeam);
          epos.rects.push(new GRect(10, 10)._budget(x, leverMinY + (
            isUp ? 0 : h)));

          if (originCombo._eobjects[1]._mobj.nths.seq > 2) {
            var num = originCombo._eobjects[1]._mobj.nths.seq;
            epos.pushOperations(ctx._draw("num-" + num, 0, (sy + ey) / 2 + (
              isUp ? -15 : 6), 8, 12)._attach(baseBeam, GStroke.Const
              .ConstraintXCenter));
          }

          // _linkObject levers middle note of to beam
          for (var i = 1; i < eoArr.length - 1; ++i) {
            var lever = eoArr[i]._beamCombine._opl;
            var lambda = (lever.x - sx) / dx;
            lever.args[0] = (1 - lambda) * sy + lambda * ey;
          }

          if (originCombo._subBeamLayout) {
            // draw beams stand for 16th, 32th and so on
            for (var bms, i = 0; bms = originCombo._subBeamLayout[i]; ++i) {
              for (var cn = 0; cn < bms.length; cn += 2) {
                var line2 = ctx._lineWh(0, 0, 0, 0, 3);
                var lvr1 = eoArr[bms[cn]]._beamCombine._opl;
                var lvr2 = eoArr[bms[cn + 1]]._beamCombine._opl;
                var offy = isUp ? (i + 1) * 3 : 3 - 6 * (i + 1);
                if (bms[cn] == bms[cn + 1]) {
                  // broken beam, which has an _end without setting up
                  if (bms[cn] == eoArr.length - 1) {
                    lvr2 = eoArr[bms[cn] - 1]._beamCombine._opl;
                    line2.x = (lvr1.x + lvr2.x) / 2;

                    line2._attach(lvr1, GStroke.Const.ConstraintX2).
                    _attach(baseBeam, GStroke.Const.ConstraintParallelHorizon,
                      offy);
                  } else {
                    lvr2 = eoArr[bms[cn] + 1]._beamCombine._opl;
                    line2.args[0] = (lvr1.x + lvr2.x) / 2;

                    line2._attach(lvr1, GStroke.Const.ConstraintX).
                    _attach(baseBeam, GStroke.Const.ConstraintParallelHorizon,
                      offy);
                  }
                } else {
                  // set the beam two ends upon the anchor lever
                  line2._attach(lvr1, GStroke.Const.ConstraintX).
                  _attach(lvr2, GStroke.Const.ConstraintX2).
                  _attach(baseBeam, GStroke.Const.ConstraintParallelHorizon,
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
      } else { // draw tail
        var tail;
        if (isUp) {
          tail = ctx._draw("tailu-" + this.nthBeat, leverX, y);
          chordWidth += 5;
        } else {
          tail = ctx._draw("taild-" + this.nthBeat, leverX, y);
        }
        tail._attach(opl, GStroke.Const.ConstraintX);
        epos.pushOperations(tail);
      }
    }
  }

  epos.width = chordWidth;
  epos.rowIndex = ctx.rowIndex;
  epos.rowOriginPoint = ctx.rowOriginPoint;

  // budget over or under marks

  if (this._overmarks) {
    var l0y = etrack.translate(0);
    var ouy = noteImg.y;
    var omk, pmk = null;
    if (l0y > ouy) l0y = ouy;
    for (var oum of this._overmarks) {
      l0y -= 4;
      epos.pushOperations(omk = ctx._draw(oum, 0, l0y)
        ._attach(noteImg, GStroke.Const.ConstraintXCenter)
        ._attach(pmk, GStroke.Const.ConstraintTopOn, l0y));
      pmk = omk;
      l0y = 0;
    }
  }

  if (this._oumark) {
    if (isUp) {
      var l0y = etrack.translate(0);
      var ouy = noteImg.y;
      if (l0y > ouy) l0y = ouy;
      for (var oum of this._oumark) {
        l0y -= 16;
        epos.pushOperations(ctx._draw(oum, 0, l0y)
          ._attach(noteImg, GStroke.Const.ConstraintXCenter));
      }
    } else {
      var l4y = etrack.translate(0);
      var ouy = noteImg.y;
      if (l4y < ouy) l4y = ouy;
      for (var oum of this._oumark) {
        l0y += 16;
        epos.pushOperations(ctx._draw(oum, 0, l4y)
          ._attach(noteImg, GStroke.Const.ConstraintXCenter));
      }
    }
  }

  // draw ties
  if (this._mobj && this._mobj._linkObject && this._mobj._linkObject._end ==
    this._mobj) {
    var arr = LinkTies(this, ctx, etrack.score.trackLength, isUp);
    return epos.pushOperations(...arr);
  }

  if (this.arpeggio) {
    epos.pushOperations(ctx._draw("arpeggio", x, y));
  }

  if (shiftX > 0) epos.shx = {
    x: shiftX
  };

  return epos;
}

EChord.prototype._upTailDegree = function() {
  var Mdf = -100,
    mdf = 100;
  for (var e, i = 0; e = this.notes[i]; i++) {
    if (e.line > Mdf) Mdf = e.line;
    if (e.line < mdf) mdf = e.line;
  }

  return Mdf + mdf - 4;
}


function LinkTies(main, ctx, trackLength, isUp) {
  var epos = [];

  function _addCurve(epos1, epos2, isUp) {
    var curve, tadpo1 = epos1.operations[0],
      tadpo2 = epos2.operations[0];
    var interRowTies = epos1.rowIndex != epos2.rowIndex;
    if (interRowTies) {
      console.log("inter-row ties");
      var dummyTadpo = {};
      dummyTadpo.x = epos1.rowOriginPoint.x + trackLength + tadpo2.x - epos2
        .rowOriginPoint.x;
      dummyTadpo.y = epos1.rowOriginPoint.y + tadpo2.y - epos2.rowOriginPoint.y;

      if (isUp) {
        curve = ctx._curve(dummyTadpo.x, dummyTadpo.y + 8, tadpo1.x, tadpo1.y +
          8, 2)._attach(tadpo1, GStroke.Const.ConstraintX2);
      } else {
        curve = ctx._curve(tadpo1.x, tadpo1.y - 6, dummyTadpo.x, dummyTadpo.y -
          6, 2).
        _attach(tadpo1, GStroke.Const.ConstraintX);
      }
      epos.push(curve);

      dummyTadpo.x = epos2.rowOriginPoint.x - trackLength + tadpo1.x - epos1
        .rowOriginPoint.x;
      dummyTadpo.y = epos2.rowOriginPoint.y + tadpo1.y - epos1.rowOriginPoint.y;
      if (isUp) {
        curve = ctx._curve(tadpo2.x, tadpo2.y + 8, dummyTadpo.x, dummyTadpo.y +
          8, 2)._attach(tadpo2, GStroke.Const.ConstraintX);
      } else {
        curve = ctx._curve(dummyTadpo.x, dummyTadpo.y - 6, tadpo2.x, tadpo2.y -
          6, 2)._attach(tadpo2, GStroke.Const.ConstraintX2);
      }
      epos.push(curve);
    } else {
      if (isUp) {
        curve = ctx._curve(tadpo2.x, tadpo2.y + 8, tadpo1.x, tadpo1.y + 8, 2)
          ._attach(tadpo1, GStroke.Const.ConstraintX2)
          ._attach(tadpo2, GStroke.Const.ConstraintX);
      } else {
        curve = ctx._curve(tadpo1.x, tadpo1.y - 6, tadpo2.x, tadpo2.y - 6, 2)
          ._attach(tadpo1, GStroke.Const.ConstraintX)
          ._attach(tadpo2, GStroke.Const.ConstraintX2);
      }
      epos.push(curve);
    }
  }

  var tadpo2 = main._mobj._linkObject._start[0]._eobj.epos,
    tadpo1;
  if (main._mobj._linkObject._start.length > 1) {
    for (var tadi = 1; tadi < main._mobj._linkObject._start.length; tadi++) {
      tadpo1 = tadpo2;
      tadpo2 = main._mobj._linkObject._start[tadi]._eobj.epos;
      _addCurve(tadpo1, tadpo2, isUp);
    }
  }
  tadpo1 = tadpo2;
  tadpo2 = main._mobj._linkObject._end._eobj.epos;
  _addCurve(tadpo1, tadpo2, isUp);
  return epos;
}
