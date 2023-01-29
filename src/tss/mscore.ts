/********************************
 *
 * MScore
 *
 * @constructor
 *
 *******************************/
class MScore {
  _tracks: Array<MTrack>
  _repeatCourse: MRepeatCourse
  constructor() {
    this._tracks = [];
  }

  get tracks(): Array<MTrack> { return this._tracks; }
  track(idx: number) { return this._tracks[idx]; }

  appendTrack(): MTrack {
    let track = MakeMTrack();
    this._tracks.push(track);
    return track;
  }

  makeRepeatCourse(): void {
    if (this._tracks.length <= 0 || this._repeatCourse) return;

    let track = this._tracks[0];
    let cursorBeat = 0;
    let rc = new MRepeatCourse();
    for (let bi = 0, bar; bar = track.bars[bi]; ++bi) {
      for (let ci = 0, mch; mch = bar.chords[ci]; ++ci) {
        // Convert MChord to TChord
        if (mch instanceof MMark) {
          if (mch.kind == 'barline') {
            if (mch.subtype == 3) {
              // Repeat segment begin
              rc._push(cursorBeat, MRepeatCourse.Const.Begin);
            } else if (mch.subtype == 4) {
              // Repeat segment end
              rc._push(cursorBeat, MRepeatCourse.Const.End);
            } else if (mch.subtype == 7) {
              // Repeat segment begin and end
              rc._push(cursorBeat, MRepeatCourse.Const.End);
              rc._push(cursorBeat, MRepeatCourse.Const.Begin);
            }
          }
        } else if (mch instanceof MChord) {
          let beat = mch.beat.endBeat;
          if (cursorBeat < beat) {
            cursorBeat = beat;
          }
        } else if (mch instanceof MRest) {
          let beat = mch.beat.endBeat;
          if (cursorBeat < beat) {
            cursorBeat = beat;
          }
        }
      }
    }

    this._repeatCourse = rc;
  }
}
