/********************************
 *
 * TChord
 * @constructor
 *
 *******************************/
class TChord {
  notes: Array<TNote>
  endBeat: number
  startBeat: number
  beat: number

  arpeggio: boolean
  constructor(...args: TNote[]) {
    this.notes = [...args];
    var n = this.notes[0];
    if (n != null) {
      this.endBeat = n.endBeat;
      this.startBeat = n.startBeat;
      this.beat = n.beat;
    }
  }

  _match(tn) {
    var n = this.notes[0];
    return n ? n._match(tn) : false;
  }

  elapse() {
    return this.beat;
  }

  _sound(ctx, offset) {
    for (var i = 0, n; n = this.notes[i]; ++i) {
      n._sound(ctx, offset);
    }
  }
}
