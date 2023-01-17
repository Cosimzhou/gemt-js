/********************************
 *
 *   GTimeSlice
 *
 *******************************/
class GTimeSlice {
  beatlen: number
  _start: number
  constructor(b: number = 0, s: number = 0) {
    this.beatlen = b || 0;
    this._start = s;
  }

  _shift(offset: number): GTimeSlice {
    this._start += offset;
    return this;
  }

  static bl(l): number {
    return (l instanceof GTimeSlice ? l.beatlen: l);
  }
  _equal(diff: GTimeSlice|number): boolean {
    return this.beatlen === GTimeSlice.bl(diff);
  }

  less(obj: GTimeSlice|number): boolean {
    return this.beatlen < GTimeSlice.bl(obj);
  }

  add(diff: GTimeSlice|number): number {
    return this.beatlen + GTimeSlice.bl(diff);
  }

  sub(diff: GTimeSlice|number): number {
    return this.beatlen - GTimeSlice.bl(diff);
  }

  addTo(diff: GTimeSlice|number): GTimeSlice {
    this.beatlen += GTimeSlice.bl(diff);
    return this;
  }

  subTo(diff: GTimeSlice|number): GTimeSlice {
    this.beatlen -= GTimeSlice.bl(diff);
    return this;
  }

  movTo(diff: GTimeSlice|number): GTimeSlice {
    this.beatlen = GTimeSlice.bl(diff);
    return this;
  }

  after(obj: number): boolean {
    return this._start > obj;
  }

  clone(): GTimeSlice {
    return new GTimeSlice(this.beatlen, this._start);
  }

  get endBeat(): number {
    return this._start + this.beatlen;
  }

  set endBeat(endBeat: number) {
    this.beatlen = endBeat - this._start;
  }

  setTimeSlice(b: number, s: number): GTimeSlice {
    this.beatlen = b;
    this._start = s;
    return this;
  }

  setSlice(s: number, e: number): GTimeSlice {
    this.beatlen = e - s;
    this._start = s;
    return this;
  }

  follow(mts: GTimeSlice): GTimeSlice {
    this._start = mts.endBeat;
    return this;
  }
}
