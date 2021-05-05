/********************************
 *
 * ENote
 *
 * @constructor
 *******************************/
function ENote(ns, l = 0, s = null) {
  var n = ns[0];
  this.imgK = n < 4 ? (n < 2 ? "fullnote" : "note2") : "note";
  this.img = gEID.get(this.imgK);
  this.line = l;
  this.nth = n;
  this.sign = s;
  if (ns.length > 1) {
    if (ns[1] == 2 * ns[0]) {
      this.float = true;
    }
    if (ns[2] == 2 * ns[1]) {
      this.ffloat = true;
    }
  }
}
exports.ENote = ENote;
impl(ENote, EScoreElement);

ENote.prototype.width = function() {
  // note head width
  return this.nth > 1 ? 7.65 : 12.6;
}

ENote.prototype._budget = function(ctx, etrack, x) {
  // budget note head, float point and flat/sharp symbol only
  var w = this.width(),
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
    dot._attach(noteImg, GStroke.Const.ConstraintX, w + 3);
    epos.width += 4;
    epos.rect.width += 4;
    if (this.ffloat) {
      // draw double float point
      epos.pushOperations(dot = ctx._dot(x + w + 7, y, 1));
      dot._attach(noteImg, GStroke.Const.ConstraintX, w + 7);
      epos.width += 5;
      epos.rect.width += 5;
    }
  }

  if (this.sign !== null) {
    // draw sharp or flat symbol
    var imgS = gEID.get(this.sign);
    epos.pushOperations(ctx._draw(this.sign, x - 2 - imgS.width, oy));
    epos.shx = {
      x: imgS.width + 2
    };
  }
  epos.img = noteImg;
  return epos;
}
