/*************************************************
 *
 * TPlayer
 *
 *
 * Useful events:
 *  noteOn, noteOff, setTempo, programChange, controller and pitchBend.
 *
 *  noteOn/noteOff:
 *    {
 *      deltaTime: ,
 *      channel: number,
 *      type: 'channel',
 *      velocity: number,
 *      noteNumber: number,
 *      subtype: 'noteOn'/'noteOff',
 *    }
 *
 *  setTempo:
 *    {
 *      deltaTime: ,
 *      type: 'meta',
 *      microsecondsPerBeat: number,
 *      subtype: 'setTempo'
 *    }
 *
 *  controller:
 *    {
 *      deltaTime: ,
 *      channel: number,
 *      type: 'channel',
 *      controllerType: ,
 *      value: ,
 *      subtype: 'controller',
 *    }
 *
 *  programChange:
 *    {
 *      deltaTime: ,
 *      channel: number,
 *      type: 'channel',
 *      programNumber: ,
 *      subtype: 'programChange',
 *    }
 *
 *  pitchBend:
 *    {
 *      deltaTime: ,
 *      channel: number,
 *      type: 'channel',
 *      value: ,
 *      subtype: 'pitchBend',
 *    }
 *
 * Notice the tpb and mpb.
 ***********************************************/

class TPlayer {
  _player: any
  _midi: any
  constructor(midi, player) {
    //if (player == null) {
    //  player = exports['MIDI'];
    //  if (player == null)
    //    console.error("Player not found, defaut MIDI not supported");
    //  player = player['Player'];
    //  if (player == null)
    //    console.error("Player not found, defaut Player not supported");
    //}
    this._midi = midi;
    this.player = player;
  }

  set player(p: any) {
    this._player = p;
    this._player.replayer = Replayer(this._midi, p.timeWarp);
    this._player.data = this._player.replayer.getData();
    for (var elem of this._player.data) {
      if (elem[0]['event']['subtype'] == 'programChange') {
        elem[0]['event']['programNumber'] = 0;
      }
    }
    this._player.endTime = this._player.replayer.getLength();
    console.log(this._player.data, this._player.endTime);
  }

  resume(): void {
    if (this._player['playing']) {
      this._player['pause']();
    } else {
      var me = this;
      this._player['resume'](function(events) {
        if (events.length == 0) {
          console.log("end");
        }
      });
    }
  }

  playing(): boolean {
    return this._player['playing'];
  }

  stop(): void {
    this._player['stop']();
  }
}
