/********************************
 *
 * EBlank
 *
 * @constructor
 *******************************/
class EBlank implements ELayoutBudget {
  width: number;
  constructor(w?: number) {
    this.width = w || g_option.marginBlank;
  }

  _budget(
    ctx,
    etrack: ETrack,
    x: number,
    trkPos?: Array<ETrackPositionInfo>
  ): EPositionInfo {
    var y = etrack.translate(0);
    var epos = new EPositionInfo(this.width, 32, x, y);
    return epos;
  }
}
