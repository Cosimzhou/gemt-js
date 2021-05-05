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
