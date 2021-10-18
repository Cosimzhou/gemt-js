/********************************
 *
 * MScore
 *
 * @constructor
 *
 *******************************/
function MScore() {
  this._tracks = [];
}
exports.MScore = MScore;

MScore.prototype.tracks = function(idx = null) {
  if (idx == null)
    return this._tracks;
  return this._tracks[idx];
}

MScore.prototype.appendTrack = function() {
  var track = MakeMTrack();
  this._tracks.push(track);
  return track;
}

MScore.prototype.makeRepeatCourse = function() {
  if (this._tracks.length <= 0 || this._repeatCourse) return;

  var track = this._tracks[0];
  var cursorBeat = 0;
  var rc = new MRepeatCourse();
  for (var bi = 0, bar; bar = track.bars[bi]; ++bi) {
    for (var ci = 0, mch; mch = bar.chords[ci]; ++ci) {
      // Convert MChord to TChord
      if (mch instanceof MMark) {
        if (mch.kind == 'barline') {
          if (mch.type == 3) {
            // Repeat segment begin
            rc._push(cursorBeat, MRepeatCourse.Const.Begin);
          } else if (mch.type == 4) {
            // Repeat segment end
            rc._push(cursorBeat, MRepeatCourse.Const.End);
          } else if (mch.type == 7) {
            // Repeat segment begin and end
            rc._push(cursorBeat, MRepeatCourse.Const.End);
            rc._push(cursorBeat, MRepeatCourse.Const.Begin);
          }
        }
      } else if (mch instanceof MChord) {
        var beat = mch.beat.endBeat();
        if (cursorBeat < beat) {
          cursorBeat = beat;
        }
      } else if (mch instanceof MRest) {
        var beat = mch.beat.endBeat();
        if (cursorBeat < beat) {
          cursorBeat = beat;
        }
      }
    }
  }

  this._repeatCourse = rc;
}
