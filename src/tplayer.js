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

function TPlayer(player, midi) {
  this._player = player;
  this._player.replayer = new Replayer(midi, player.timeWarp);
  this._player.data = this._player.replayer.getData();
  this._player.endTime = this._player.replayer.getLength();
}
exports.TPlayer = TPlayer;

TPlayer.prototype.resume = function () {
  if (this._player['playing']) {
    this._player['pause']();
  } else {
    this._player['resume']();
  }
}

TPlayer.prototype.playing = function () {
  return this._player['playing'];
}

TPlayer.prototype.stop = function () {
  this._player['stop']();
}

