/********************************
 *
 * MClef
 * 谱号
 * @constructor
 *
 *******************************/
class MClef {
  _type: number
  _tone: MTone

  order: number
  o8: number
  high: number
  low: number
  base: number
  off: number
  level: number
  line: number
  constructor(n: number, t?: MTone) {
    this._type = n;
    this._tone = t;
    this.load();
  }

  static Const = {
    GClef: 0,
    FClef: 1,
    CClef: 2,
    CClefTensor: 3,
    ova8: 0,
    ovb8: 8,
    clefRange: [
      // g-clef
      { low: 64, high: 77, base: 67, level: 4, line: 3 },
      // f-clef
      { low: 43, high: 57, base: 53, level: 3, line: 1 },
      // c-clef
      { low: 53, high: 67, base: 60, level: 0, line: 2 },
      // c-clef tensor
      { low: 50, high: 64, base: 60, level: 0, line: 1 },
      //
      { low: 0, high: 14, base: 0, level: 0, line: 4 }
    ],
  };

  get tone(): MTone { return this._tone; }
  set tone(t: MTone) { this._tone = t; this.load() }
  get type(): number { return this._type; }
  set type(t: number) { this._type = t; this.load() }

  load(): void {
    var clefData = MClef.Const.clefRange[this._type % 4];
    for (let prop in clefData) this[prop] = clefData[prop];

    let off = this._type >> 4;
    if (this._type & 8) {
      off = -off;
    }
    this.base += 12 * off;
    this.off = off;

    if (this._tone == null)
      return;

    var order = this._tone.noteOrder(this.base);
    if (order * 2 % 2 == 1) {
      if (this._tone.flat) {
        order -= .5;
        this.base -= 1;
      } else {
        order += .5;
        this.base += 1;
      }
    }
    this.order = order;
    this.o8 = Math.floor((this.base - this._tone.nTone) / 12);
  }

  noteLine(n: number): MNoteLineInfo {
    var order = this._tone.noteOrder(n);
    var sign = null;
    if (order * 2 % 2 == 1) {
      if (this._tone.flat) {
        order += .5;
        sign = "flat";
      } else {
        order -= .5;
        sign = "sharp";
      }
    }
    var o8 = Math.floor((n - this._tone.nTone) / 12);
    var diff = order - this.order + 7 * (o8 - this.o8);
    return new MNoteLineInfo(this.line - diff / 2, sign);
  }

  lineOrder(l: number): number {
    return (this.line - l) * 2 % 7 + this.order;
  }

  _equal(mc: MClef): boolean {
    return mc._type == this._type && mc._tone._equal(this._tone);
  }

  _convertMark(preClef: MClef = null): Array<ELayoutBudget> {
    var ms = [];

    if (preClef == null) {
      switch (this._type) {
        case 0:
          ms.push(new EMark('g-clef', 3));
          break;
        case 1:
          ms.push(new EMark('f-clef', 1));
          break;
        case 2:
          ms.push(new EMark('c-clef', 2));
          break;
        case 3:
          ms.push(new EMark('c-clef', 1));
          break;
      }
      if (this._tone && this._tone.shifts.length) {
        let sym = this._tone.symbol == '#' ? 'sharp' : 'flat';
        for (let i = 0; i < this._tone.shifts.length; ++i) {
          let l = this.line - (this._tone.shifts[i] + 7 - this.level) % 7 / 2;
          if (l >= 3) l -= 3.5;
          if (l <= -1) l += 3.5;
          ms.push(new EMark(sym, l));
        }
      }
    }

    return ms;
  }

  countExtraLine(mchord: MChord): number {
    var overline = 0,
      underline = 0;
    for (let n of mchord.notes) {
      if (n.pitch > this.high) {
        overline += Math.floor(-this.noteLine(n.pitch).line);
      } else if (n.pitch < this.low) {
        underline += Math.floor(this.noteLine(n.pitch).line - 4);
      }
    }

    return overline + underline;
  }

}


class MNoteLineInfo {
  line: number
  sign: string
  constructor(l: number, s: string) {
    this.line = l;
    this.sign = s;
  }
}
