
/********************************
 * EBlank
 * @constructor
 *******************************/
function EBlank(w) {
  this.width = w||g_option.marginBlank;
}
exports['EBlank'] = EBlank;
EBlank.prototype.budget = function(ctx, etrack, x) {
  var y = etrack.translate(0);
  var epos = new EPositionInfo(this.width, 32, x, y);
  return epos;
}
