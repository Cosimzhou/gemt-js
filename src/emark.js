
/********************************
 * EMark
 * @constructor
 *******************************/
function EMark(imgk, l = 0, m = 0) {
  this.imgK = imgk;
  this.img = gEID.get(imgk);
  this.line = l + (m?0.5:0);
}
exports['EMark'] = EMark;
EMark.prototype.budget = function(ctx, etrack, x) {
  var y = etrack.translate(this.line);
  var epos = new EPositionInfo();//this.img.budget(x, y);
  epos.rect = this.img.budget(x, y);
  epos.width = this.img.width;
  if (this.imgK == 'flat' || this.imgK == 'sharp') {
    epos.noMargin=true;
  }
  epos.pushOperations(ctx._draw(this.imgK, x, y));
  return epos;
}
