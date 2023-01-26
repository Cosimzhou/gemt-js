/**************************************************************
 *
 * EBarline
 *
 * @constructor
 *  NOTICE:
 *  1. EBarline must be settle in the first track in EScore
 *
 *************************************************************/
class EBarline extends ELayerBase {// implements EScoreElement {
  _barlineType: number
  _lineFresh: boolean
  constructor(t: number) {
    super();
    this._barlineType = t;
    this._lineFresh = false;
  }

  _forceReturn(): void {
    this._lineFresh = true;
  }

  _budget(ctx, track: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    var endTrk = trkPos[trkPos.length - 1];
    var oy = trkPos[0].y,
      y = endTrk.ey;
    var height = y - oy;
    var epos, line1, line2;
    switch (this._barlineType) {
      case 0: // single line
        epos = new EPositionInfo(3, height, x, oy);
        epos.pushOperations(line1 = ctx._Vline(x, oy, _)._attach(endTrk.bl,
          GStrokeConstraintType.ConstraintY2));
        epos.pushOperations(ctx._xmark(_, 0, { cut: 1 })._attach(line1, GStrokeConstraintType.ConstraintX, 0));
        break;
      case 1: // end line
        epos = new EPositionInfo(8, height, x, oy);
        epos.pushOperations(line1 = ctx._Vline(x, oy, _)._attach(endTrk.bl,
            GStrokeConstraintType.ConstraintY2),
          line2 = ctx._VlineW(_, oy, _, 3)._attach(line1, GStrokeConstraintType
            .ConstraintX, 3)._attach(endTrk.bl, GStrokeConstraintType.ConstraintY2),
          ctx._xmark(_, 6)._attach(line2, GStrokeConstraintType.ConstraintX, 3));
        break;
      case 2: // double line
        epos = new EPositionInfo(4, height, x, oy);
        epos.pushOperations(line1 = ctx._Vline(x, oy, _)._attach(endTrk.bl,
            GStrokeConstraintType.ConstraintY2),
          line2 = ctx._Vline(_, oy, _)._attach(line1, GStrokeConstraintType
            .ConstraintX, 3)._attach(endTrk.bl, GStrokeConstraintType.ConstraintY2),
          ctx._xmark(_, 3, { cut: 1 })._attach(line1, GStrokeConstraintType.ConstraintX, 3));
        break;
      case 3: // repeat line begin
        epos = new EPositionInfo(14, height, x, oy);
        epos.pushOperations(line1 = ctx._VlineW(x, oy, _, 3)._attach(endTrk.bl,
            GStrokeConstraintType.ConstraintY2),
          ctx._Vline(_, oy, _)._attach(line1, GStrokeConstraintType.ConstraintX,
            6)._attach(endTrk.bl, GStrokeConstraintType.ConstraintY2));
        for (var trk, i = 0; trk = trkPos[i]; ++i) {
          // no need attch for y coordinate
          epos.pushOperations(ctx._dot(_, _, 2)._attach(line1, GStrokeConstraintType
              .ConstraintX, 10)._attach(trk.bl, GStrokeConstraintType.ConstraintY, -
              12),
            ctx._dot(_, _, 2)._attach(line1, GStrokeConstraintType.ConstraintX, 10)
            ._attach(trk.bl, GStrokeConstraintType.ConstraintY, -20));
        }

        epos.pushOperations(ctx._xmark(_, 3, {
          cut: epos.length,
          eobj: this,
        })._attach(line1, GStrokeConstraintType.ConstraintX, 3));
        break;
      case 4: // repeat line end
        epos = new EPositionInfo(14, height, x, oy);
        epos.pushOperations(line1 = ctx._VlineW(x + 8, oy, y, 3)._attach(endTrk
            .bl, GStrokeConstraintType.ConstraintY2),
          ctx._Vline(x + 5, oy, y)._attach(line1, GStrokeConstraintType.ConstraintX, -
            3)._attach(endTrk.bl, GStrokeConstraintType.ConstraintY2));

        for (var trk, i = 0; trk = trkPos[i]; ++i) {
          // no need attch for y
          epos.pushOperations(ctx._dot(_, _, 2)._attach(line1, GStrokeConstraintType
              .ConstraintX, -8)._attach(trk.bl, GStrokeConstraintType.ConstraintY, -
              12),
            ctx._dot(_, _, 2)._attach(line1, GStrokeConstraintType.ConstraintX, -
              8)._attach(trk.bl, GStrokeConstraintType.ConstraintY, -20));
        }
        epos.pushOperations(ctx._xmark(_, 3)._attach(line1, GStrokeConstraintType
          .ConstraintX, 3));
        break;
      case 5: // dash line
        epos = new EPositionInfo(3, height, x, oy);
        for (var trk, i = 0; trk = trkPos[i]; ++i) {
          epos.pushOperations(line1 = ctx._vline(x, _, 7)._attach(trk.bl,
              GStrokeConstraintType.ConstraintY, -32),
            ctx._vline(x, _, 7)._attach(trk.bl, GStrokeConstraintType.ConstraintY, -
              19),
            ctx._vline(x, _, 7)._attach(trk.bl, GStrokeConstraintType.ConstraintY, -8)
          );
        }
        break;
      case 6: // null line
        epos = new EPositionInfo(3, height, x, oy);
        epos.pushOperations(ctx._xmark(x, 0));
        break;
      case 7: // repeat line end and another begin
        epos = new EPositionInfo(21, height, x, oy);
        epos.pushOperations(
          line1 = ctx._Vline(x + 8, oy, y)._attach(endTrk.bl, GStrokeConstraintType
            .ConstraintY2),
          ctx._VlineW(_, oy, y, 3)._attach(line1, GStrokeConstraintType
            .ConstraintX, 2)._attach(endTrk.bl, GStrokeConstraintType.ConstraintY2));

        // draw dots before the vertical lines
        for (var trk, i = 0; trk = trkPos[i]; ++i) {
          epos.pushOperations(ctx._dot(_, _, 2)._attach(
              line1, GStrokeConstraintType.ConstraintX, -6)._attach(
              trk.bl, GStrokeConstraintType.ConstraintY, -12),
            ctx._dot(_, _, 2)._attach(line1, GStrokeConstraintType.ConstraintX, -6)._attach(trk.bl, GStrokeConstraintType
              .ConstraintY, -20));
        }

        // the begin line part
        epos.pushOperations(
          ctx._Vline(_, oy, y)._attach(line1, GStrokeConstraintType.ConstraintX,
            7)._attach(endTrk.bl, GStrokeConstraintType.ConstraintY2));

        // draw dots around the vertical lines
        for (var trk, i = 0; trk = trkPos[i]; ++i) {
          epos.pushOperations(ctx._dot(_, _, 2)._attach(line1,
              GStrokeConstraintType.ConstraintX, 12)._attach(trk.bl, GStrokeConstraintType
              .ConstraintY, -12),
            ctx._dot(_, _, 2)._attach(line1, GStrokeConstraintType
              .ConstraintX, 12)._attach(trk.bl, GStrokeConstraintType
              .ConstraintY, -20));
        }

        epos.pushOperations(ctx._xmark(_, 0, {
          cut: trkPos.length * 2 + 1,
          eobj: this,
        })._attach(line1, GStrokeConstraintType.ConstraintX, 5));
        break;
    }

    return epos;
  }
}
