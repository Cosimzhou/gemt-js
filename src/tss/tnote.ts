/********************************
 *
 * TNote
 * @constructor
 *
 *******************************/

class TNote {
  nPitch: number
  stime: number
  etime: number
  sveloc: number
  eveloc: number
  startBeat: number
  endBeat: number
  _channel: number
  _onEnv: any
  instrument: number
  _tpb: number

  _rtstart: number
  _rtend: number
  constructor(n: number, st: number, et: number = null, sv: number = null, ev: number = null) {
    this.nPitch = n;
    this.stime = st;
    this.etime = et || this.stime + 100;
    this.sveloc = sv || 127;
    this.eveloc = ev || 0;
  }

  elapse(): number {
    return this.etime - this.stime;
  }
  get beat(): number { return this.endBeat - this.startBeat; }

  _match(tn): boolean {
    return this.startBeat == tn.startBeat && this.endBeat == tn.endBeat &&
      this.sveloc == tn.sveloc && this.eveloc == tn.eveloc;
  }

  _sound(ctx, offset): void {
    if (offset <= this._rtstart) {
      var channel = this._channel || 0;
      ctx.noteOn(channel, this.nPitch, this.sveloc, this._rtstart - offset);
      ctx.noteOff(channel, this.nPitch, this.eveloc, this._rtend - offset);
    }
  }
}
