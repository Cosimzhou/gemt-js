
/********************************
 *
 * MScore
 *
 * @constructor
 *
 *******************************/
function MScore(){
  this.tracks = [];
}
exports['MScore'] = MScore;
MScore.prototype.getBar = function(i) {
  var bars = [];
  for (var t of this.tracks) {
    bars.push(t.bars[i]);
  }
  return bars;
}
