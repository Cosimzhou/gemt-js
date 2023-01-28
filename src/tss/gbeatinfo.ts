/********************************
 *
 * GBeatInfo
 *
 * @constructor
 *******************************/

class GBeatInfo implements MRepeatElement {
  x: number
  rowIndex: number
  beat: number
  func: number

  constructor(x: number, row: number, beat: number) {
    this.x = x;
    this.rowIndex = row;
    this.beat = beat;
  }

  _attach(barl): void {
    this.func = barl._barlineType;
  }

  clone(): GBeatInfo {
    return new GBeatInfo(this.x, this.rowIndex, this.beat);
  }

  _seqVal(): number {
    return this.beat;
  }

  _shift(v: number): void {
    this.beat += v;
  }
}
