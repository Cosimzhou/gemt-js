/********************************
 *
 * GPlayer
 *
 * @constructor
 *******************************/

interface ITempoEvent {
  microsecondsPerBeat: number
  startBeat: number
}

class GTimeSequence {
  milliseconds: Array<number>
  constructor(bps: Array<GBeatInfo>, events: Array<ITempoEvent>, tempo: number) {
    if (events == null) events = [];
    this.milliseconds = [0];
    events.push({microsecondsPerBeat: 0, startBeat: Infinity});
    for (let i = 0, bp, evni = 0, event = events[evni], startTime = 0, startBeat = 0; bp = bps[i]; i++) {
      while (event.startBeat <= bp.beat) {
        startTime += tempo * (event.startBeat - startBeat);
        startBeat = event.startBeat;
        tempo = event.microsecondsPerBeat / 1000.0;
        event = events[++evni];
      }
      this.milliseconds.push(startTime + tempo * (bp.beat - startBeat));
    }
  }

  searchTime(targetMs: number): number {
    return searchRange(this.milliseconds, targetMs, 1);
  }
}

class GPlayer {
  startTime: number
  offsetTime: number
  _player: IPlayer
  playIntervalHandle: number
  gcontext: GContext
  tempo: number // milliseconds per beat
  timeSequence: GTimeSequence

  onPlay: ()=>void
  onStop: ()=>void
  onRefresh: ()=>void
  constructor() {
    this.tempo = 60000 / 120;
  }

  set player(p: IPlayer) { this._player = p; }
  get context(): GContext { return this.gcontext; }
  set context(ctx: GContext) {
    this.gcontext = ctx;
    this.timeSequence = new GTimeSequence(ctx.beatPositions, ctx.tempoList, this.tempo);
  }

  stop(): void {
    var me = this;
    me._player.stop();
    setTimeout(function(){ me._player.stop();}, 50);
    clearInterval(this.playIntervalHandle);
    this.playIntervalHandle = null;

    this.onStop && this.onStop();
  }

  resume(): void {
    this.startTime = Date.now();
    this._player.resume();
    if (this.playing) {
      if (this.playIntervalHandle)
        clearInterval(this.playIntervalHandle);

      if (this.gcontext.cursor === this.gcontext.beatPositions.length) {
        this.gcontext.cursor = 0;
      }

      this.offsetTime = this.timeSequence.milliseconds[this.gcontext.cursor];
      if (this.gcontext.cursor === 0) {
        this.gcontext.rewind();
        this.gcontext.cursor = 1;
        this.playRedraw(true);
      }

      let me = this;
      this.playIntervalHandle = setInterval(function(){
        me.playRedraw();
      }, Math.trunc(60000 / 120 / 8));

      this.onPlay && this.onPlay();
    } else {
      clearInterval(this.playIntervalHandle);
      this.playIntervalHandle = null;
      this.onStop && this.onStop();
    }
  }

  seek(time: number): void {
    if (this.playing) return;
    let millis = time*1000.0;
    let cursor = this.timeSequence.searchTime(millis);
    this.gcontext.cursor = cursor;
    if (cursor === 0) {
      this._player.seek(0);
      return;
    }
    let beat = this.gcontext.beatPositions[cursor-1].beat;
    this._player.seek(beat);
  }

  seekByCursor(cursor: number): void {
    if (this.playing) return;
    cursor = Math.min(this.gcontext.beatPositions.length, cursor);
    if (cursor >= 0) {
      if (cursor) {
        let beat = this.gcontext.beatPositions[cursor-1].beat;
        this._player.seek(beat);
      }
      this.gcontext.cursor = cursor;

      this.gcontext.clear();
      this.gcontext.print();

      this.onRefresh && this.onRefresh();
    }
  }

  get playing(): boolean { return this._player.playing; }

  playRedraw(force?: boolean): void {
    let duration = Date.now() - this.startTime;
    let time = duration + this.offsetTime;
    let cursor = this.timeSequence.searchTime(time);
    if (cursor !== this.gcontext.cursor) {
      this.gcontext.cursor = cursor;
      force = true;
    }
    if (cursor === this.gcontext.beatPositions.length) {
      this.stop();
      force = true;
    }

    if (force) {
      this.gcontext.clear();
      this.gcontext.print();

      this.onRefresh && this.onRefresh();
    }
  }
}
