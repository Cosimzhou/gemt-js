/********************************
 *
 * MTone
 * @constructor
 *
 *
 * Arguments:
 *      n       Main note order
 *      flat    flat, natural or sharp
 *******************************/
class MTone {
  nTone: number
  flat: boolean
  info: string
  symbol: string
  shifts: Array<number>
  shifted: Set<number>
  constructor(n: number = 0, flat: boolean = false) {
    this.nTone = n % 12;
    this.flat = flat;
    this.info = "";
    this.symbol = "";
    this.shifts = [];
    this.shifted = new Set(this.load());
  }

  static Const = {
    // #: G D A E B #F #C; #G E #A F C
    SharpSerial: [3, 0, 4, 1, 5, 2, 6, 3, 0, 4, 1, 5],
    SharpKey: {
      7: 1,
      2: 2,
      9: 3,
      4: 4,
      11: 5,
      6: 6,
      1: 7,
      8: 8,
      3: 9,
      10: 10,
      5: 11,
      0: 12
    },
    // b: F bB bE bA bD bG B; bF A D G C
    FlatSerial: [6, 2, 5, 1, 4, 0, 3, 5, 1, 4, 0, 3],
    FlatKey: {
      5: 1,
      10: 2,
      3: 3,
      8: 4,
      1: 5,
      6: 6,
      11: 7,
      4: 8,
      9: 9,
      2: 10,
      7: 11,
      0: 12
    },
  }

  _equal(t: MTone): boolean {
    return t.nTone == this.nTone && t.flat == this.flat;
  }

  /********************************
   * setKeySignature
   *
   * Set tone by key signature. For examples,
   * 2 means 2 sharp marks, and -3 means 3
   * flat marks; they represent D Major and
   * bE Major respectively.
   *******************************/
  setKeySignature(k: number): void {
    if (k > 0) {
      this.nTone = k * 7 % 12;
      this.flat = false;
    } else {
      this.nTone = (-k) * 5 % 12;
      this.flat = true;
    }
    this.shifted = new Set(this.load());
  }
  /********************************
   * noteOrder
   *
   * Arguments:
   *      n   MNote or integer which represents the order of
   *          the note.
   * Return:
   *      The order level of the in this tone major.
   *******************************/
  noteOrder(n: MNote|number): number {
    var h = MNote.toPitch(n) % 12;
    var order = (h + 12 - this.nTone) % 12;
    return (order > 4 ? order + 1 : order) / 2;
  }
  /********************************
   *  load
   *
   *
   *******************************/
  load(): Array<number> {
    // Whether the main order note is on black key in this tone
    // so, if not, the tone mark does not need flat or sharp
    // mark.
    var k = 1 << this.nTone;
    var flen = MTone.Const.FlatKey[this.nTone],
      slen = MTone.Const.SharpKey[this.nTone];
    if (k & MConst.MajorKey) {
      // In this case, main order note is on black key of paino.
      if (this.nTone == 0) {
        this.shifts = [];
        this.symbol = "";
      } else {
        if (flen < slen) {
          this.symbol = 'b';
          this.shifts = MTone.Const.FlatSerial.slice(0, flen);
        } else {
          this.symbol = '#';
          this.shifts = MTone.Const.SharpSerial.slice(0, slen);
        }
        return this.shifts;
      }
    } else {
      if (this.flat) {
        if (flen <= 7) {
          this.symbol = 'b';
          this.shifts = MTone.Const.FlatSerial.slice(0, flen);
        } else {
          this.symbol = '#';
          this.shifts = MTone.Const.SharpSerial.slice(0, slen);
        }
      } else {
        if (slen <= 7) {
          this.symbol = '#';
          this.shifts = MTone.Const.SharpSerial.slice(0, slen);
        } else {
          this.symbol = 'b';
          this.shifts = MTone.Const.FlatSerial.slice(0, flen);
        }
      }
    }
    return this.shifts;
  }
}
