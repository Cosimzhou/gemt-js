/********************************
 *
 * ERest
 *
 * @constructor
 *******************************/
class ERest extends ELayerBase {
  nth: number
  imgK: string
  img: GRect

  constructor(n: number) {
    super();
    this.nth = n;
    if (n >= 4) {
      this.imgK = "rest-" + n;
      this.img = g_GInfo.get(this.imgK);
    }
  }

  _budget(ctx, etrack: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    var w = 0,
      y, epos;
    if (this.nth < 0) {
      w = 60;
      y = etrack.translate(1);
      epos = new EPositionInfo(w, 4, x, y);
      epos.pushOperations(ctx._vline(x, y, 16),
        ctx._vline(x + w, y, 16),
        ctx._lineWh(x, y + 5, x + w, y + 5, 6),
        ctx._draw("num-" + (-this.nth), x + w / 2 - 4.5, y - 22, 9, 12));
    } else if (this.nth <= 2) {
      w = 10;
      y = etrack.translate(1) + (this.nth > 1 ? 4 : 0);
      epos = new EPositionInfo(w, 4, x, y);
      epos.pushOperations(ctx._rect(x, y, w, 4));
    } else {
      y = etrack.translate(2);
      epos = new EPositionInfo();
      epos.rect = this.img._budget(x, y);
      epos.width = this.img.width;
      epos.pushOperations(ctx._draw(this.imgK, x, y));
    }

    return epos;
  }
}
