
/********************************
 * EChord
 * @constructor
 *******************************/
function EChord() {
  this.nthBeat = 1;
  this.notes = [...arguments].sort(function(a, b){return a.line-b.line});
  if (this.notes.length>0) {
    this.nthBeat = this.notes[0].nth;
  }
}
exports['EChord'] = EChord;
EChord.prototype.budget = function(ctx, etrack, x) {
  var chordWidth = 0, w = 0, maxLineOfNote = -100, minLineOfNote = 100, shiftX = 0;
  var need_tail = false, epos = new EPositionInfo();
  var adjacent_shift = false, adjlast_shift = false, noteImg;
  var note_heads = [], adjnote_heads = [], adjnote_indices = [];
  epos.rect.clear();


  for (var e, ll = -100, i = 0; e = this.notes[i]; i++) {
    var enoteEpos = e.budget(ctx, etrack, x);
    var ew = e.width();
    if (ll+0.5 == e.line) {
      enoteEpos.img.attach(noteImg, this.notes[i-1].width());
      enoteEpos.width += this.notes[i-1].width();
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
    var i;
    // overlines
    for (i = -1; i >= minLineOfNote; --i) {
        epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), w+8).attach(noteImg, -4));
    }
    // underlines
    for (i = 5; i <= maxLineOfNote; ++i) {
        epos.pushOperations(ctx._hline(x - 4, etrack.translate(i), w+8).attach(noteImg, -4));
    }
  }

  this.epos = epos;
  var isUp = this.force? this.force.up: (maxLineOfNote  > 4 - minLineOfNote);
  if (need_tail) {
    var leverX = x, leverEndY, y, leverNoteY, leverMinY, h;
    var maxYOfNote = etrack.translate(maxLineOfNote), minYOfNote = etrack.translate(minLineOfNote);
    var maxYOfLever = maxYOfNote + 3*etrack.gap, minYOfLever = minYOfNote - 3*etrack.gap;
    var midYOfTrack = etrack.translate(2), opl;
    if (isUp) {
      //if (adjacent_shift) {
      //    //leverX += w;
      //    for (var adjnote of adjnote_heads) {
      //        adjnote.pos.img.detach(1).attach(noteImg, -w);//adjnote.pos.img.width());
      //    }
      //    for (var rnote of note_heads) {
      //        ctx.shift(rnote.pos.ops, w, 0);
      //    }
      //}
      leverX += w;
      leverMinY = y = midYOfTrack > minYOfLever? minYOfLever: midYOfTrack;
      leverNoteY = maxYOfNote, leverEndY = y;
      h = maxYOfNote - y;
    } else {
      if (adjacent_shift) {
        //leverX += w;
        for (var adjnote of adjnote_heads) {
          adjnote.img.detach(1).attach(noteImg, -w);//adjnote.pos.img.width());
        }
        for (var rnote of note_heads) {
          ctx.shift(rnote.operations, w, 0);
        }
      }
      y = midYOfTrack < maxYOfLever? maxYOfLever: midYOfTrack;
      leverNoteY = leverMinY = minYOfNote, leverEndY = y;
      h = y -minYOfNote;
      // fix
    }
    epos.maxYOfNote = maxYOfNote;
    epos.minYOfNote = minYOfNote;

    // draw lever
    epos.rect.union(new GRect(w, h, x, leverMinY));
    epos.pushOperations(opl = ctx._Vline(leverX, leverNoteY, leverEndY));
    opl.attach(noteImg, leverX-x);

    if (this.nthBeat > 4) {
      if (this.beamComb) { // draw beam
        this.beamComb.opl = opl;
        if (this.beamComb.beamPhase == 2) {
            var sx = this.beamComb.originBeamComb.epos.end.anchorOp.x,
                dy = y - this.beamComb.originBeamComb.epos.end.anchorOp.args[0],
                dx = opl.x - sx, // assert dx > 0
                ldy = dx*Math.tan(Math.PI/12),
                k = Math.atan2(dy, dx);
            if (k < -Math.PI/12) {
              if (isUp) {
                this.beamComb.originBeamComb.epos.end.anchorOp.args[0] = opl.args[0]+ldy;
              } else {
                opl.args[0] = this.beamComb.originBeamComb.epos.end.anchorOp.args[0]-ldy;
              }
              dy = -ldy;
            } else if (k > Math.PI/12) {
              if (isUp) {
                opl.args[0] = this.beamComb.originBeamComb.epos.end.anchorOp.args[0]+ldy;
              } else {
                this.beamComb.originBeamComb.epos.end.anchorOp.args[0] = opl.args[0]-ldy;
              }
              dy = ldy;
            }

            var sy = this.beamComb.originBeamComb.epos.end.anchorOp.args[0], ey = opl.args[0];
            var eoArr = this.beamComb.originBeamComb.eo;
            {
              // avoid middle note crash with beam
              var semy = sy, seMy = ey, dmargin = -Infinity;
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
                  this.beamComb.originBeamComb.epos.end.anchorOp.args[0] = sy, opl.args[0]=ey;
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
                  this.beamComb.originBeamComb.epos.end.anchorOp.args[0] = sy, opl.args[0]=ey;
                }
              }
            }
            if (this.beamComb.originBeamComb.bms) {
              // adjust the beam position for multi-beam
              var offy = this.beamComb.originBeamComb.bms.length * 3;
              if (isUp) {
                sy -= offy, ey -= offy;
              } else {
                sy += offy, ey += offy;
              }
              this.beamComb.originBeamComb.epos.end.anchorOp.args[0] = sy, opl.args[0] = ey;
            }

            // draw base beam of the combined chords
            var baseBeam = ctx._lineWh(0, sy, 0, ey, 3);
            baseBeam.attach(this.beamComb.originBeamComb.epos.end.anchorOp).attach(opl);
            epos.pushOperations(baseBeam);

            // link levers middle note of to beam
            for (var i = 1; i < eoArr.length-1; ++i) {
              var lever = eoArr[i].beamComb.opl;
              var lambda = (lever.x - sx)/dx;
              lever.args[0] = (1-lambda)*sy+lambda*ey;
            }

            if (this.beamComb.originBeamComb.bms) {
              // draw beams stand for 16th, 32th and so on
              for (var bms, i = 0; bms = this.beamComb.originBeamComb.bms[i]; ++i) {
                for (var cn = 0; cn < bms.length; cn+=2) {
                  var line2 = ctx._lineWh(0, 0, 0, 0, 3);
                  var lvr1 = eoArr[bms[cn]].beamComb.opl;
                  var lvr2 = eoArr[bms[cn+1]].beamComb.opl;
                  var offy = isUp? (i+1) * 3: 3 - 6 * (i+1);
                  if (bms[cn] == bms[cn+1]) {
                    // broken beam, which has an end without setting up
                    if (bms[cn] == eoArr.length-1) {
                      lvr2 = eoArr[bms[cn]-1].beamComb.opl;
                      line2.x = (lvr1.x + lvr2.x)/2;

                      line2.attach(lvr1, 0, 2).attach(baseBeam, offy, GStroke.Const.ConstraintParallelHorizon);
                    } else {
                      lvr2 = eoArr[bms[cn]+1].beamComb.opl;
                      line2.args[0] = (lvr1.x + lvr2.x)/2;

                      line2.attach(lvr1).attach(baseBeam, offy, GStroke.Const.ConstraintParallelHorizon);
                    }
                  } else {
                    // set the beam two ends upon the anchor lever
                    line2.attach(lvr1).attach(lvr2).attach(baseBeam, offy, GStroke.Const.ConstraintParallelHorizon);
                  }
                  epos.pushOperations(line2);
                }
              }
            }
        } else if (this.beamComb.beamPhase == 0) {
          this.beamComb.originBeamComb.epos = epos;
          epos.end = {anchorOp: opl};
        }
      } else { // draw tail
        var tail;
        if (isUp) {
          tail = ctx._draw("tailu-"+this.nthBeat, leverX, y);
          chordWidth += 5;
        } else {
          tail = ctx._draw("taild-"+this.nthBeat, leverX, y);
        }
        tail.attach(opl, 0);
        epos.pushOperations(tail);
      }
    }
  }
  epos.width = chordWidth;
  epos.rowIndex = ctx.rowIndex;
  epos.rowOriginPoint = ctx.rowOriginPoint;

  // draw ties
  if (this.mobj && this.mobj.link) {
    if (this.mobj.link.end == this.mobj) {
      function addCurve(epos1, epos2, isUp) {
        var curve, tadpo1 = epos1.operations[0], tadpo2 = epos2.operations[0];
        var interRowTies = epos1.rowIndex != epos2.rowIndex;
        if (interRowTies) {
          console.log("inter-row ties");
          var dummyTadpo = {};//x:tadpo2.x, y:tadpo2.y};
          dummyTadpo.x = epos1.rowOriginPoint.x + etrack.score.trackLength + tadpo2.x - epos2.rowOriginPoint.x;
          dummyTadpo.y = epos1.rowOriginPoint.y + tadpo2.y - epos2.rowOriginPoint.y;

          if (isUp) {
            curve = ctx._curve(dummyTadpo.x, dummyTadpo.y+8, tadpo1.x, tadpo1.y + 8, 3).attach(tadpo1, 0, 2);
          } else {
            curve = ctx._curve(tadpo1.x, tadpo1.y-6, dummyTadpo.x, dummyTadpo.y - 6, 3).attach(tadpo1, 0, 1);
          }
          epos.pushOperations(curve);

          dummyTadpo.x = epos2.rowOriginPoint.x - etrack.score.trackLength + tadpo1.x - epos1.rowOriginPoint.x;
          dummyTadpo.y = epos2.rowOriginPoint.y + tadpo1.y - epos1.rowOriginPoint.y;
          if (isUp) {
            curve = ctx._curve(tadpo2.x, tadpo2.y+8, dummyTadpo.x, dummyTadpo.y + 8, 3).attach(tadpo2, 0, 1);
          } else {
            curve = ctx._curve(dummyTadpo.x, dummyTadpo.y-6, tadpo2.x, tadpo2.y - 6, 3).attach(tadpo2, 0, 2);
          }
          epos.pushOperations(curve);
        } else {
          if (isUp) {
            curve = ctx._curve(tadpo2.x, tadpo2.y+8, tadpo1.x, tadpo1.y + 8, 3).attach(tadpo1, 0, 2).attach(tadpo2, 0, 1);
          } else {
            curve = ctx._curve(tadpo1.x, tadpo1.y-6, tadpo2.x, tadpo2.y - 6, 3).attach(tadpo1, 0, 1).attach(tadpo2, 0, 2);
          }
          epos.pushOperations(curve);
        }
      }

      var tadpo2 = this.mobj.link.start[0].eobj.epos, tadpo1;
      if (this.mobj.link.start.length > 1) {
        for (var tadi = 1; tadi < this.mobj.link.start.length; tadi++) {
          tadpo1 = tadpo2;
          tadpo2 = this.mobj.link.start[tadi].eobj.epos;
          addCurve(tadpo1, tadpo2, isUp);
        }
      }
      tadpo1 = tadpo2;
      tadpo2 = this.mobj.link.end.eobj.epos;
      addCurve(tadpo1, tadpo2, isUp);
    }
  }

  if (this.arpeggio) {
    epos.pushOperations(ctx._draw("arpeggio", x, y));
  }

  if (shiftX > 0) epos.shx = {x: shiftX};

  return epos;
}

EChord.prototype.isTailUp = function() {
  var Mdf = -100, mdf = 100;
  for (var e, i = 0; e = this.notes[i]; i++) {
    if (e.line > Mdf) Mdf = e.line;
    if (e.line < mdf) mdf = e.line;
  }

  return (Mdf  > 4 - mdf);
}
EChord.prototype.upTailDegree = function() {
  var Mdf = -100, mdf = 100;
  for (var e, i = 0; e = this.notes[i]; i++) {
    if (e.line > Mdf) Mdf = e.line;
    if (e.line < mdf) mdf = e.line;
  }

  return Mdf + mdf - 4;
}

