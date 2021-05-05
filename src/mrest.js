/********************************
 *
 * MRest
 * @constructor
 *
 *******************************/
function MRest(b) {
  this.beatLength = b;
}
exports.MRest = MRest;
impl(MRest, MInterface);

MRest.prototype._convertToE = function() {
  var newobj = new ERest(this.nths[0]);
  newobj._oumark = this._oumark;
  newobj._overmarks = this._overmarks;
  newobj._undermarks = this._undermarks;
  return newobj;
}

MRest.prototype.clone = function() {
  var rest = new MRest(this.beatLength)
  rest.beat = this.beat.clone();
  return rest;
}
