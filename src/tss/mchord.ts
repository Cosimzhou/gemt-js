/********************************
 *
 * MChord
 * @constructor
 *
 *
 *******************************/
//class MChordLinkInfo {
//  _start: Array<MChord> //{eobj}
//  _end: MChord
//}

class MChord extends MLayerBase implements EBeamCombinable, EArchCombinable {
  notes: Array<MNote>
  info: string
  tone: number

  _linkObject: MChordLinkInfo
  _beamCombine: EConjunctBeamInfo

  constructor(...args: MNote[]) {
    super();
    this.notes = Array.from(arguments);
    this.info = "";
    this.tone = 0;
    //this.nths = new MBeatSequence();

    this.notes.sort(MNote.comparator);
  }

  override _convertToE(clef: MClef): ELayerBase {
    var nths = this.nths;
    var newobj = new EChord(...Array.from(this.notes, function(n) {
      let nli = clef.noteLine(n.pitch);
      return new ENote(nths, nli.line, nli.sign);
    }));
    newobj.ouattach = this.ouattach;
    return newobj;
  }

  clone(): MChord {
    var nmc = new MChord();
    for (let n of this.notes) {
      nmc.notes.push(n.clone());
    }
    nmc.info = this.info;
    nmc.tone = this.tone;
    nmc.beat = this.beat.clone();
    return nmc;
  }

  linkWith(mchord: MChord, same: boolean = false) {
    if (this._linkObject == null) {
      let linkObj = new MChordLinkInfo(mchord, this, same);
      this._linkObject = linkObj;
      mchord._linkObject = linkObj;
    } else {
      this._linkObject._start.push(mchord);
      mchord._linkObject = this._linkObject;
    }
  }

  // 生成和弦的特征
  _charactorize(): number {
    var n = 0;
    for (var e of this.notes) {
      n |= 1 << (e.pitch % 12);
    }
    return n;
  }

  analysis(): void {
    var ck = this._charactorize();
    var ck1 = ck & (ck - 1);
    if (ck1 == 0) {
      // single note pitch
      this.tone = this.notes[0].pitch % 12;
      this.info = MConst.ToneList[this.tone] + "音";
    } else {
      for (var i = 0; i < 12; i++) {
        for (var e of MConst.ChordsInfo) {
          if (ck == e[0]) {
            this.tone = i;
            this.info = MConst.ToneList[i] + "调" + e[2];
            return;
          }
        }
        ck = (ck >> 1) | (ck & 1 ? 0x800 : 0);
      }

      if ((ck1 & (ck1 - 1)) == 0) {
        var diff = this.notes[0].pitch - this.notes[1].pitch;
        if (diff > 0) {
          this.tone = this.notes[1].pitch;
          this.info = this.notes[1].tone() + "+" + MConst.DegreeList[diff][1];
        } else {
          this.tone = this.notes[0].pitch;
          this.info = this.notes[0].tone() + "+" + MConst.DegreeList[-diff % 12]
            [1];
        }
        return;
      }
    }
  }

  /********************************
   *
   * 和弦统一移调
   *******************************/
  shift(n: number): void {
    for (let e, i = 0; e = this.notes[i]; ++i)
      e.shift(n);
  }

  /********************************
   * 计算拍子
   *******************************/
  nth(): number {
    return 4 / this.beat.beatlen;
  }
}
