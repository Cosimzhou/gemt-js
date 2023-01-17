interface MInterface {
  beat: GTimeSlice
  nths: MBeatSequence
  _convertToE: (clef?: MClef) => EScoreElement
};

interface EScoreElement  {
  _budget: (ctx: any, track: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>) => EPositionInfo
};

interface MRepeatElement {
  _shift: (v) =>void,
  _seqVal: () =>void
}


interface EConjunctable {
  _beamCombine: EConjunctBeamInfo
}

class GOUAttachment {
  _oumark: Array<string>
  _overmarks: Array<string>
  _undermarks: Array<string>
  constructor(o1: Array<string>, o2: Array<string>, o3: Array<string>){
    this._oumark = o1;
    this._overmarks =o2;
    this._undermarks = o3;
  }

  static make(o1: Array<string>, o2: Array<string>, o3: Array<string>): GOUAttachment {
    if (o1 != null || o2 != null || o3 != null) {
      return new GOUAttachment(o1, o2, o3);
    }
    return null;
  }
}

interface GOUAttachable {
  ouattach: GOUAttachment
}

class MiChordLinkInfo {
  _start: Array<MLayerBase> //{eobj}
  _end: MLayerBase
  _same: boolean
  constructor(m1: MLayerBase, m2: MLayerBase, s: boolean = false) {
    this._start = [m1];
    this._end = m2;
    this._same = s;
  }
}

class MLayerBase implements MInterface, EConjunctable, GOUAttachable {
  // MInterface
  beat: GTimeSlice
  nths: MBeatSequence
  _convertToE(clef?: MClef): EScoreElement {
    return null;
  }

  // EConjunctable
  _beamCombine: EConjunctBeamInfo

  // GOUAttachable
  ouattach: GOUAttachment

  // ELayerBase
  _eobj: ELayerBase

  _linkObject: MiChordLinkInfo
}

class ELayerBase implements EScoreElement, EConjunctable, GOUAttachable {
  _mobj: MLayerBase

  // EScoreElement
  _budget(ctx: any, track: ETrack, x: number, trkPos?: Array<ETrackPositionInfo>): EPositionInfo {
    return null;
  }

  // EConjunctable
  _beamCombine: EConjunctBeamInfo

  // GOUAttachable
  ouattach: GOUAttachment
}


