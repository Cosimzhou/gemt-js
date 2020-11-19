/********************************
 *
 * MScore
 *
 * @constructor
 *
 *******************************/
function MScore(){
  this._tracks = [];
}
exports.MScore = MScore;
// MScore.prototype.getBar = function(i) {
//   var bars = [];
//   for (var t of this.tracks) {
//     bars.push(t.bars[i]);
//   }
//   return bars;
// }

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
