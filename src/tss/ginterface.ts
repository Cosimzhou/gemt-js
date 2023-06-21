/********************************
 *
 * Interfaces
 *
 *******************************/

interface MInterface {
  beat: GTimeSlice;
  nths: MBeatSequence;
  _convertToE: (clef?: MClef) => ELayoutBudget;
  clone: () => MInterface;
}

interface ELayoutBudget {
  _budget: (
    ctx: any,
    track: ETrack,
    x: number,
    trkPos?: Array<ETrackPositionInfo>
  ) => EPositionInfo;
}

interface MRepeatElement {
  _shift: (v) => void;
  _seqVal: () => void;
}

interface EBeamCombinable {
  _beamCombine: EConjunctBeamInfo;
}

class GOUAttachment {
  _oumark: Array<string>;
  _overmarks: Array<string>;
  _undermarks: Array<string>;
  constructor(o1: Array<string>, o2: Array<string>, o3: Array<string>) {
    this._oumark = o1;
    this._overmarks = o2;
    this._undermarks = o3;
  }

  static make(
    o1: Array<string>,
    o2?: Array<string>,
    o3?: Array<string>
  ): GOUAttachment {
    if (o1 != null || o2 != null || o3 != null) {
      return new GOUAttachment(o1, o2, o3);
    }
    return null;
  }
}

interface GOUAttachable {
  ouattach: GOUAttachment;
}

class MChordLinkInfo {
  _start: Array<MLayerBase>; // Array<EArchCombinable> //{eobj}
  _end: MLayerBase; // EArchCombinable
  _same: boolean;
  constructor(m1: MLayerBase, m2: MLayerBase, s: boolean = false) {
    this._start = [m1];
    this._end = m2;
    this._same = s;
  }
}

interface EArchCombinable {
  _linkObject: MChordLinkInfo;
}

class MLayerBase implements MInterface, GOUAttachable {
  // MInterface
  beat: GTimeSlice;
  nths: MBeatSequence;
  _convertToE(clef?: MClef): ELayoutBudget {
    return null;
  }
  clone(): MLayerBase {
    return null;
  }

  // GOUAttachable
  ouattach: GOUAttachment;

  // ELayerBase
  _eobj: ELayerBase;
}

class ELayerBase implements ELayoutBudget, GOUAttachable {
  _mobj: MLayerBase;

  // EScoreElement
  _budget(
    ctx: any,
    track: ETrack,
    x: number,
    trkPos?: Array<ETrackPositionInfo>
  ): EPositionInfo {
    return null;
  }

  // GOUAttachable
  ouattach: GOUAttachment;

  epos: EPositionInfo;
}

interface IPlayer {
  stop(): void;
  resume(): void;
  seek(t: number): void;
  playing: boolean;
}
