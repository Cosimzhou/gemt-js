
/********************************
 * ERest
 * @constructor
 *******************************/
function ERest(n) {
  this.nth = n;
  if (n >= 4) {
    this.imgK = "rest-"+n;
    this.img = gEID.get(this.imgK);
  }
}
exports['ERest'] = ERest;
ERest.prototype.budget = function(ctx, etrack, x) {
  var w = 0, y, epos;
  if (this.nth <= 2) {
    w = 10;
    y = etrack.translate(1) + (this.nth > 1? 4: 0);
    epos = new EPositionInfo(w, 4, x, y);
    epos.pushOperations(ctx._rect(x, y, w, 4));
  } else {
    y = etrack.translate(2);
    epos = new EPositionInfo();
    epos.rect = this.img.budget(x, y);
    epos.width = this.img.width;
    epos.pushOperations(ctx._draw(this.imgK, x, y));
  }
  return epos;
}
