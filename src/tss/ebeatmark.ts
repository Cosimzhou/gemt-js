/********************************
 *
 * EBeatMark
 *
 * @constructor
 *
 *******************************/

class EBeatMark implements ELayoutBudget {
  numerator: number;
  denominator: number;

  constructor(n: number = 4, d: number = 4) {
    this.numerator = n;
    this.denominator = d;
  }

  _budget(
    ctx,
    etrack: ETrack,
    x: number,
    trkPos?: Array<ETrackPositionInfo>
  ): EPositionInfo {
    var y = etrack.translate(0),
      ym = etrack.translate(2);
    var epos = new EPositionInfo(10, 32, x, y);

    var num: number = this.numerator;
    var arr = [],
      preImg,
      img;
    while (num) {
      img = ctx._draw("num-" + (num % 10), 0, y);
      if (preImg) preImg._attach(img, GStrokeConstraintType.ConstraintX, 6);
      arr.push((preImg = img));
      num = Math.floor(num / 10.0);
    }
    preImg.x = x;
    if (arr.length) epos.pushOperations(...arr.reverse());

    num = this.denominator;
    arr = [];
    preImg = null;
    while (num) {
      img = ctx._draw("num-" + (num % 10), 0, ym);
      if (preImg) preImg._attach(img, GStrokeConstraintType.ConstraintX, 6);
      arr.push((preImg = img));
      num = Math.floor(num / 10.0);
    }
    preImg.x = x;
    if (arr.length) epos.pushOperations(...arr.reverse());

    return epos;
  }
}
