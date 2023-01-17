/*********************************
 *
 * MNote
 * @constructor
 *******************************/
class MNote {
  pitch: number
  constructor(h) {
    this.pitch = h;
  }


  static toPitch(p): number {return p.pitch || p;}
  static comparator(a, b) { return a.pitch - b.pitch; }
  /********************************
   * 获取音名
   *******************************/
  tone(): string {
    return MConst.ToneList[this.pitch % 12];
  }
  /********************************
   * 获取完整音名
   *******************************/
  fulltone(): string {
    return MConst.ToneList[this.pitch % 12] + (this.pitch / 12);
  }

  /********************************
   *
   * 移调
   *******************************/
  shift(n: number): void {
    this.pitch += n;
  }

  //MNote.prototype.order(t) {
  //    var idx = ((this.pitch % 12) + 12 - t)%12, mod = idx>4? 1: 0;
  //    return idx%2 == mod? (idx+mod)>>1: null;    // major tone
  //}
  clone() {
    return new MNote(this.pitch);
  }
}
