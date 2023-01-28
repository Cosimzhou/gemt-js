/********************************
 *
 * EMark
 *
 * @constructor
 *******************************/
class EMark implements ELayoutBudget {
  imgK: string
  img: GRect
  line: number
  overnote: boolean

  constructor(imgk: string, l: number = 0, m: number = 0) {
    this.imgK = imgk;
    this.img = g_GInfo.get(imgk);
    this.line = l + (m ? 0.5 : 0);
    this.overnote = false;
  }

  _budget(ctx, etrack: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    let y = etrack.translate(this.line);
    let epos = new EPositionInfo();
    epos.rect = this.img._budget(x, y);
    epos.width = this.img.width;
    if (this.imgK === 'flat' || this.imgK === 'sharp' || this.imgK === 'natural') {
      epos.noMargin = true;
    }

    epos.pushOperations(epos.mainStroke = ctx._draw(this.imgK, x, y));

    return epos;
  }
}
