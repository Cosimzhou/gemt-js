/********************************
 *
 * ENote
 *
 * @constructor
 *******************************/
class ENote implements ELayoutBudget {
  imgK: string
  img: GRect
  line: number
  nth: number
  sign: string
  float: boolean
  ffloat: boolean

  constructor(ns: MBeatSequence, l: number = 0, s: string = null) {
    var n = ns.nths[0];
    this.imgK = n < 4 ? (n < 2 ? "fullnote" : "note2") : "note";
    this.img = g_GInfo.get(this.imgK);
    this.line = l;
    this.nth = n;
    this.sign = s;
    if (ns.nths.length > 1) {
      if (ns.nths[1] == 2 * ns.nths[0]) {
        this.float = true;
      }
      if (ns.nths[2] == 2 * ns.nths[1]) {
        this.ffloat = true;
      }
    }
  }

  static comparator = function(a, b) {
    return a.line - b.line;
  }

  // note head width
  get width(): number { return this.img.width; }

  _budget(ctx, etrack, x: number): EPositionInfo {
    // budget note head, float point and flat/sharp symbol only
    var w = this.width,
      y = etrack.translate(this.line),
      oy = y;
    var noteImg = ctx._draw(this.imgK, x, oy);
    var epos = new EPositionInfo();
    epos.rect = this.img._budget(x, y);
    epos.width = epos.rect.width;
    epos.pushOperations(noteImg);

    if (this.float) {
      // draw float point
      y = oy + ((this.line * 2) % 2 == 0 ? 4 : 0);
      var dot;
      epos.pushOperations(dot = ctx._dot(x + w + 3, y, 1));
      dot._attach(noteImg, GStrokeConstraintType.ConstraintX, w + 3);
      epos.width += 4;
      epos.rect.width += 4;
      if (this.ffloat) {
        // draw double float point
        epos.pushOperations(dot = ctx._dot(x + w + 7, y, 1));
        dot._attach(noteImg, GStrokeConstraintType.ConstraintX, w + 7);
        epos.width += 5;
        epos.rect.width += 5;
      }
    }

    if (this.sign !== null) {
      // draw sharp or flat symbol
      var imgS = g_GInfo.get(this.sign);
      epos.pushOperations(ctx._draw(this.sign, x - 2 - imgS.width, oy));
      epos.shx = {
        x: imgS.width + 2
      };
    }
    epos.img = noteImg;
    return epos;
  }
}
