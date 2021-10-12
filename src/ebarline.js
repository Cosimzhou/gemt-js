/**************************************************************
 *
 * EBarline
 *
 * @constructor
 *  NOTICE:
 *  1. EBarline must be settle in the first track in EScore
 *
 *************************************************************/
function EBarline(t) {
  this._barlineType = t;
  this._lineFresh = false;
}
exports.EBarline = EBarline;
impl(EBarline, EScoreElement);

EBarline.prototype._budget = function(ctx, x, trkPos) {
  this._lineFresh = true;
}

EBarline.prototype._budget = function(ctx, x, trkPos) {
  var endTrk = trkPos[trkPos.length - 1];
  var oy = trkPos[0].y,
    y = trkPos[trkPos.length - 1].ey;
  var height = y - oy;
  var epos, line1, line2;
  switch (this._barlineType) {
    case 0: // single line
      epos = new EPositionInfo(3, height, x, oy);
      epos.pushOperations(ctx._Vline(x, oy, _)._attach(endTrk.bl, GStroke
        .Const.ConstraintY2));
      break;
    case 1: // end line
      epos = new EPositionInfo(8, height, x, oy);
      epos.pushOperations(line1 = ctx._Vline(x, oy, _)._attach(endTrk.bl,
          GStroke.Const.ConstraintY2),
        line2 = ctx._VlineW(_, oy, _, 3)._attach(line1, GStroke.Const
          .ConstraintX, 3)._attach(endTrk.bl, GStroke.Const.ConstraintY2),
        ctx._xmark(_, 6)._attach(line2, GStroke.Const.ConstraintX, 3));
      break;
    case 2: // double line
      epos = new EPositionInfo(4, height, x, oy);
      epos.pushOperations(line1 = ctx._Vline(x, oy, _)._attach(endTrk.bl,
          GStroke.Const.ConstraintY2),
        line2 = ctx._Vline(_, oy, _)._attach(line1, GStroke.Const
          .ConstraintX, 3)._attach(endTrk.bl, GStroke.Const.ConstraintY2),
        ctx._xmark(x + 3, 3)._attach(line1, GStroke.Const.ConstraintX, 3));
      break;
    case 3: // repeat line begin
      epos = new EPositionInfo(14, height, x, oy);
      epos.pushOperations(line1 = ctx._VlineW(x, oy, _, 3)._attach(endTrk.bl,
          GStroke.Const.ConstraintY2),
        ctx._Vline(_, oy, _)._attach(line1, GStroke.Const.ConstraintX,
          6)._attach(endTrk.bl, GStroke.Const.ConstraintY2));
      for (var i = 0; i < trkPos.length; ++i) {
        // no need attch for y coordinate
        epos.pushOperations(ctx._dot(x + 9, trkPos[i].y + 8 + 4, 2),
          ctx._dot(x + 9, trkPos[i].y + 16 + 4, 2));
      }
      break;
    case 4: // repeat line end
      epos = new EPositionInfo(14, height, x, oy);
      epos.pushOperations(line1 = ctx._VlineW(x + 8, oy, y, 3)._attach(endTrk
          .bl, GStroke.Const.ConstraintY2),
        ctx._Vline(x + 5, oy, y)._attach(line1, GStroke.Const.ConstraintX, -
          3)._attach(endTrk.bl, GStroke.Const.ConstraintY2));

      for (var i = 0; i < trkPos.length; ++i) {
        // no need attch for y
        epos.pushOperations(ctx._dot(x + 2, trkPos[i].y + 8 + 4, 2)._attach(
            line1, GStroke.Const.ConstraintX, -8),
          ctx._dot(x + 2, trkPos[i].y + 16 + 4, 2)._attach(line1, GStroke
            .Const.ConstraintX, -8));
      }
      epos.pushOperations(ctx._xmark(x + 11, 3)._attach(line1, GStroke.Const
        .ConstraintX, 3));
      break;
    case 5: // dash line
      epos = new EPositionInfo(3, height, x, oy);
      for (var i = 0; i < trkPos.length; ++i) {
        var y = trkPos[i].y;
        epos.pushOperations(line1 = ctx._vline(x, y, 7), ctx._vline(x, y + 13,
          7), ctx._vline(x, y + 24, 7));
      }
      break;
    case 6: // null line
      epos = new EPositionInfo(3, height, x, oy);
      epos.pushOperations(ctx._vline(x, trkPos[0].y, 0));
      break;
    case 7: // repeat line end and another begin
      epos = new EPositionInfo(14, height, x, oy);
      epos.pushOperations(
        line1 = ctx._Vline(x, oy, y)._attach(endTrk.bl, GStroke.Const
          .ConstraintY2),
        ctx._VlineW(_, oy, y, 3)._attach(line1, GStroke.Const
          .ConstraintX, 2)._attach(endTrk.bl, GStroke.Const.ConstraintY2),
        ctx._Vline(_, oy, y)._attach(line1, GStroke.Const.ConstraintX,
          7)._attach(endTrk.bl, GStroke.Const.ConstraintY2));

      for (var i = 0; i < trkPos.length; ++i) {
        // no need attch for y coordinate
        epos.pushOperations(ctx._dot(_, trkPos[i].y + 8 + 4, 2)._attach(line1,
            GStroke.Const.ConstraintX, 12),
          ctx._dot(_, trkPos[i].y + 16 + 4, 2)._attach(line1, GStroke.Const
            .ConstraintX, 12));

        epos.pushOperations(ctx._dot(_, trkPos[i].y + 8 + 4, 2)._attach(
            line1, GStroke.Const.ConstraintX, -6),
          ctx._dot(_, trkPos[i].y + 16 + 4, 2)._attach(line1, GStroke
            .Const.ConstraintX, -6));
      }
      break;
  }

  return epos;
}
