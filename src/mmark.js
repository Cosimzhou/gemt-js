/*********************************
 *
 * MMark
 * @constructor
 *
 *******************************/

function MMark(kind, type = 0) {
  this.kind = kind;
  this.type = type;
  this.beat = 0;
}
exports.MMark = MMark;
impl(MMark, MInterface);

MMark.prototype._convertToE = function() {
  var newobj;
  switch (this.kind) {
    case 'barline':
      newobj = new EBarline(this.type);
      break;
    case 'rest':
      newobj = new ERest(-this.type);
      break;
    default:
      newobj = new EMark(this.kind, -1.5);
      break;
  }
  //return [newobj];
  return newobj;
}
