/********************************
 *
 * MRest
 * @constructor
 *
 *******************************/
function MRest(b) {
  this.beatLength = b;
}
exports['MRest'] = MRest;
MRest.prototype.clone = function() {
  var rest = new MRest(this.beatLength)
  rest.beat = this.beat.clone();
  return rest;
}
