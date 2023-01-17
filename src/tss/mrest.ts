/********************************
 *
 * MRest
 * @constructor
 *
 *******************************/
class MRest extends MLayerBase {
  beatLength: number

  endBeat: number
  startBeat: number
  constructor(b: number=0) {
    super();
    this.beatLength = b;
  }

  override _convertToE(clef?: MClef): ELayerBase {
    var newobj = new ERest(this.nths.nths[0]);
    newobj.ouattach = this.ouattach;
    return newobj;
  }

  clone(): MRest {
    var rest = new MRest(this.beatLength)
    rest.beat = this.beat.clone();
    return rest;
  }
}
