/********************************
 *
 * GPlayer
 *
 * @constructor
 *******************************/

interface IPlayer {
  stop():void
  resume():void
  playing():boolean
}

class GPlayer {
  startTime: number
  startBeat: number
  _player: IPlayer
  playIntervalHandle: number
  gcontext: GContext
  tempo: number // milliseconds per beat

  onPlay: ()=>void
  onStop: ()=>void
  onRefresh: ()=>void
  constructor() {
    this.tempo = 60000 / 120;

  }

  set player(p: IPlayer) { this._player = p; }
  get context(): GContext { return this.gcontext; }
  set context(ctx: GContext) { this.gcontext = ctx; }

  stop() {
    this._player.stop();
    this.onStop && this.onStop();
    clearInterval(this.playIntervalHandle);
    this.playIntervalHandle = null;
  }

  resume() {
    this.startTime = Date.now();
    this.startBeat = this.gcontext._beatCursor;
    this._player.resume();
    if (this._player.playing()) {
      if (this.playIntervalHandle)
        clearInterval(this.playIntervalHandle);

      if (this.gcontext.cursor == 0) {
        this.gcontext.rewind();
        this.gcontext.cursor = 1;
        this.startBeat = this.gcontext._beatCursor;
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

  playing(): boolean { return this._player.playing(); }

  playRedraw(force?: boolean) {
    if (this.gcontext.isOver) {
      if (this.playIntervalHandle)
        clearInterval(this.playIntervalHandle);
      this.playIntervalHandle = null;
    } else {
      let duration = (Date.now() - this.startTime);
      let beat = duration / this.tempo;// (60000 / 120);
      this.gcontext._beatCursor = beat + this.startBeat;
    }

    if (force || this.gcontext.frameRefresh()) {
      this.gcontext.clear();
      this.gcontext.print();

      this.onRefresh && this.onRefresh();
    }
  }
}
