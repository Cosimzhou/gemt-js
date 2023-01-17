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

  _attach = function(barl) {
    this.func = barl._barlineType;
  }

  clone = function() {
    return new GBeatInfo(this.x, this.rowIndex, this.beat);
  }

  _seqVal = function() {
    return this.beat;
  }

  _shift = function(v) {
    this.beat += v;
  }
}
