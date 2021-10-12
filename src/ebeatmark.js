/********************************
 *
 * EBeatMark
 *
 * @constructor
 *
 *******************************/

function EBeatMark(n = 4, d = 4) {
  this.numerator = n;
  this.denominator = d;
}
exports.EBeatMark = EBeatMark;
impl(EBeatMark, EScoreElement);

EBeatMark.prototype._budget = function(ctx, etrack, x) {
  var y = etrack.translate(0),
    ym = etrack.translate(2);
  var epos = new EPositionInfo(10, 32, x, y);

  var num = this.numerator;
  var arr = [],
    preImg, img;
  while (num) {
    img = ctx._draw("num-" + num % 10, 0, y);
    if (preImg) preImg._attach(img, GStroke.Const.ConstraintX, 6);
    arr.push(preImg = img);
    num = parseInt(num / 10);
  }
  preImg.x = x;
  if (arr.length) epos.pushOperations(...arr.reverse());

  num = this.denominator;
  arr = [];
  preImg = null;
  while (num) {
    img = ctx._draw("num-" + num % 10, 0, ym);
    if (preImg) preImg._attach(img, GStroke.Const.ConstraintX, 6);
    arr.push(preImg = img);
    num = parseInt(num / 10);
  }
  preImg.x = x;
  if (arr.length) epos.pushOperations(...arr.reverse());

  return epos;
}
