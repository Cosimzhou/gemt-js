/********************************
 *
 * MOmitter
 * @constructor
 *
 *******************************/
class MOmitter implements MInterface {
  beatLength: number
  type: number

  beat: GTimeSlice
  nths: MBeatSequence
  constructor(b: number) {
    this.beatLength = 0;
    this.type = b;

    // this.beat this.startBeat
  }

  _convertToE(clef: MClef): ELayerBase {
    //return new EChord(...Array.from(this.notes, function(n:) => new ENote(this.nths, ...
    //  clef.noteLine(n.pitch))));
    return null;
  }

  clone() {
    var omit = new MOmitter(this.beatLength)
    omit.beat = this.beat.clone();
    return omit;
  }

  time() {
    if (this.type == 0)
      console.log("beat duplicate")
    if (this.type == 1)
      console.log("bar duplicate")
    if (this.type == 2)
      console.log("double-bar duplicate")
  }
}
