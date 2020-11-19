/********************************
 *
 * MOmitter
 * @constructor
 *
 *******************************/
function MOmitter(b) {
  this.beatLength = 0;
  this.type = b;

  // this.beat this.startBeat
}
exports.MOmitter = MOmitter;

impl(MOmitter, MInterface);

MOmitter.prototype._convertToE = function(clef) {
  return new EChord(...Array.from(this.notes, n=>new ENote(this.nths, ... clef.noteLine(n.pitch))));
}

MOmitter.prototype.clone = function() {
  var omit = new MOmitter(this.beatLength)
  omit.beat = this.beat.clone();
  return omit;
}

MOmitter.prototype.time = function() {
  if (this.type == 0)
    console.log("beat duplicate")
  if (this.type == 1)
    console.log("bar duplicate")
  if (this.type == 2)
    console.log("double-bar duplicate")
}
