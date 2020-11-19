/********************************
 *
 * EBlank
 *
 * @constructor
 *******************************/
function EBlank(w) {
  this.width = w || g_option.marginBlank;
}
exports.EBlank = EBlank;
impl(EBlank, EScoreElement);

EBlank.prototype._budget = function(ctx, etrack, x) {
  var y = etrack.translate(0);
  var epos = new EPositionInfo(this.width, 32, x, y);
  return epos;
}
