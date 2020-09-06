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
  this.barlineType = t;
}
exports['EBarline'] = EBarline;
EBarline.prototype.budget = function(ctx, x, trkPos) {
  var endTrk = trkPos[trkPos.length-1];
  var oy = trkPos[0].y, y = trkPos[trkPos.length-1].ey;
  var h = y-oy;//, rect, pos = {ops:[]};
  var l1, l2;
  var epos;
  switch (this.barlineType) {
    case 0: // single line
      epos = new EPositionInfo(3, h, x, oy);
      epos.pushOperations(ctx._Vline(x, oy, y).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2));
      break;
    case 1: // end line
      epos = new EPositionInfo(8, h, x, oy);
      epos.pushOperations(l1 = ctx._Vline(x, oy, y).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2),
          l2 = ctx._VlineW(x+3, oy, y, 3).attach(l1, 3).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2),
          ctx._xmark(x+6, 6).attach(l2, 3));
      break;
    case 2: // double line
      epos = new EPositionInfo(4, h, x, oy);
      epos.pushOperations(l1 = ctx._Vline(x, oy, y).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2),
          l2 = ctx._Vline(x+3, oy, y).attach(l1, 3).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2),
          ctx._xmark(x+3, 3).attach(l1, 3));
      break;
    case 3: // repeat line begin
      epos = new EPositionInfo(14, h, x, oy);
      epos.pushOperations(l1 = ctx._VlineW(x, oy, y, 3).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2),
          ctx._Vline(x+5, oy, y).attach(l1, 6).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2));
      for (var i = 0; i < trkPos.length; ++i) {
        // no need attch for y coordinate
        epos.pushOperations(ctx._dot(x+9, trkPos[i].y+8+4, 2),
            ctx._dot(x+9, trkPos[i].y+16+4, 2));
      }
      break;
    case 4: // repeat line end
      epos = new EPositionInfo(14, h, x, oy);
      epos.pushOperations(l1 = ctx._VlineW(x+8, oy, y, 3).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2),
          ctx._Vline(x+5, oy, y).attach(l1, -3).attach(endTrk.bl, 0, GStroke.Const.ConstraintY2));

      for (var i = 0; i < trkPos.length; ++i) {
        // no need attch for y
        epos.pushOperations(ctx._dot(x+2, trkPos[i].y+8+4, 2).attach(l1, -8, GStroke.Const.ConstraintX),
            ctx._dot(x+2, trkPos[i].y+16+4, 2).attach(l1, -8, GStroke.Const.ConstraintX));
      }
      epos.pushOperations(ctx._xmark(x+11, 3).attach(l1, 3));
      break;
    case 5: // dash line
      epos = new EPositionInfo(3, h, x, oy);
      for (var i = 0; i < trkPos.length; ++i) {
        var y = trkPos[i].y;
        epos.pushOperations(l1 = ctx._vline(x, y, 7), ctx._vline(x, y+13, 7), ctx._vline(x, y+24, 7));
      }
      break;
  }
  return epos;
}


