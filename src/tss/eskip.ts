/********************************
 *
 * ESkip
 *
 * @constructor
 *******************************/
class ESkip implements ELayoutBudget {
  _skipN: number
  constructor(n: number) {
    this._skipN = n;
  }

  _budget(ctx: any, track: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    return null;
  }
}
