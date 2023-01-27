/********************************
 *
 * MTrack
 * @constructor
 *
 *******************************/
class MTrack {
  tone: string
  noteMax: number
  noteMin: number

  bars: Array<MBar>
  _tailBar: MBar
  constructor() {
    this.tone = null;
    this.noteMax = 0;
    this.noteMin = Infinity;

    this.bars = [];
    this._tailBar = null;
  }

  append(b: MBar): void {
    //assert (b instanceof MBar);
    //b._settle();
    this.bars.push(b);
  }

  /********************************
   *
   *  detectClef
   *
   *******************************/
  detectClef() {
    // TODO():
    for (var clef, b, i = 0; b = this.bars[i]; ++i) {

    }
  }


  assignClef(keySign) {
    // TODO():
    for (var b, i = 0; b = this.bars[i]; ++i) {

    }
  }

  shift(d: number): void {
    for (var b, i = 0; b = this.bars[i]; ++i) {
      for (var ch, j = 0; ch = b.chords[j]; ++j) {
        if (ch instanceof MChord) ch.shift(d);
      }
    }
  }

  analysis(): void {
    // clef   h    b   a
    // g clef 67   64  77
    // c clef 60   53  67
    // f clef 53   43  57
    var gclefh = 67,
      cclefh = 60,
      fclefh = 53;

    var tenser = new MToneTenser();
    var tensers = [],
      preten, sorbarn = 0;
    tenser.barn = 0;
    for (let b, bn = 0, i = 0; b = this.bars[i]; ++i, ++bn) {
      if (bn >= 4) {
        if (tenser.conclude()) {
          if (preten && preten.join(tenser)) {

          } else {
            tensers.push(preten = tenser);
            tenser = new MToneTenser();
            tenser.barn = sorbarn = i;
          }
          bn = 0;
        }
      }

      for (let ch, j = 0; ch = b.chords[j]; ++j) {
        if (ch instanceof MChord) {
          for (let n, k = 0; n = ch.notes[k]; ++k) {
            tenser.absorb(n);
          }
        }
      }
    }

    if (tenser.conclude()) {
      tensers.push(tenser);
    } else {
      //tensers[tensers.length-1].join(tenser);
    }

    var bt = tensers[0],
      newtenser = [bt];
    for (let bt1, i = 1; bt1 = tensers[i]; ++i) {
      if (!bt.join(bt1)) {
        if (bt.candidate == null) continue;
        if (bt.candidate && bt.candidate.size == 1) {}
        let itone:number = [...bt.candidate][0];
        bt._clef = new MClef(bt._clef, new MTone(itone));
        bt = bt1;
        newtenser.push(bt);
      }
    }
    let itone:number = [...bt.candidate][0];
    bt._clef = new MClef(bt._clef, new MTone(itone));
    tensers = newtenser;

    for (let ccf = tensers[0]._clef, ncfi = 1, i = 0, b; b = this.bars[i]; ++i) {
      if (tensers[ncfi] && i >= tensers[ncfi].barn) {
        ccf = tensers[ncfi++]._clef;
      }
      b._clef = ccf;
    }
    //console.log(tensers);
    for (var b, i = 0; b = this.bars[i]; ++i) {

    }
  }

  feed(ch: MLayerBase): void {
    this._tailBar = this._tailBar.feed(this, ch);
  }

  get currentBeat(): MBeat {
    return this._tailBar._timeBeat;
  }

  get currentBar(): MBar {
    return this._tailBar;
  }
}

function MakeMTrack() {
  var clef = new MClef(0, new MTone(0));
  var mtrk = new MTrack();
  var ts = new MBeat(4, 4);
  var bar = new MBar();
  bar.beat._start = 0;
  bar._timeBeat = ts;
  bar._clef = clef;

  mtrk._tailBar = bar;
  mtrk.bars.push(bar);
  return mtrk;
}

class MTrackFeeder {
  track: MTrack
  makeNotef: (any)=>MNote
  mabs: boolean
  base: number
  constructor(track: MTrack) {
    this.track = track;
  }

  static makeNote(x): MNote {
    return new MNote(x);
  }

  static makeNoteIn7(x: number): MNote {
    let idx = x % 10;
    let n = Math.trunc(x / 10);
    if (idx < 0) {
      n--;
      idx = -idx;
    }
    n = n * 12 + (--idx) * 2;
    if (idx >= 3) n--;

    return new MNote(n);
  }

  pushNote(notes, timeBeat: Array<number>|number = 4, linkToObjIdx = null) {
    var ch;
    if (notes == null || (notes == 0 && this.mabs)) {
      if (typeof timeBeat === 'number') {
        ch = new MRest(timeBeat);
      } else console.error('');
    } else {
      if (notes instanceof Array) {
        ch = new MChord(...notes.map(this.makeNotef));
      } else {
        ch = new MChord(this.makeNotef(notes));
      }

      // link
      if (linkToObjIdx != null) {
        let bidx = this.track.bars.length - 1;
        while (linkToObjIdx > 0 && bidx >= 0) {
          let chds = this.track.bars[bidx].chords;
          if (chds.length < linkToObjIdx) {
            linkToObjIdx -= chds.length;
            bidx--;
          } else {
            ch.linkWith(chds[chds.length - linkToObjIdx]);
            break;
          }
        }
      }
    }

    ch.beat = new GTimeSlice();
    if (timeBeat instanceof Array) {
      for (let tb of timeBeat) {
        ch.beat.addTo(this.track.currentBeat.denominator / tb);
      }
      ch.nths = new MBeatSequence(timeBeat);
      // tuplet sound
      if (timeBeat['tuplet']) {
        // this.track.currentBar.chords[];
        ch.beat.movTo(1/3);
        ch.nths.seq = timeBeat['tuplet'];
      }
    } else if (typeof(timeBeat) == 'number') {
      ch.beat.movTo(this.track.currentBeat.denominator / timeBeat);
    } else {
      console.error();
    }
    this.track.feed(ch);
    return ch;
  }

  preset(params: any) {
    let tone = params['tone'] || 0,
      clef = params['clef'] || 0;
    this.track._tailBar.clef = new MClef(clef, new MTone(tone));

    let min = params['min'] || 2,
      dem = params['dem'] || 4;
    this.track._tailBar.timeBeat = new MBeat(min, dem);
    this.mabs = !params['abs'];

    // Pickup bar
    if (params['pickup']) {
      //  this.track._tailBar.pickup = params['pickup'];
      this.track._tailBar.beat.beatlen = params['pickup'];
    }

    this.base = params['base'] || 60;
  }

  feed(content: Array<any>, params?: any) {
    if (params == null) params = {};

    this.makeNotef = this.mabs ? MTrackFeeder.makeNoteIn7 : MTrackFeeder.makeNote;
    for (let elem of content) {
      if (elem instanceof Array) {
        let ch = this.pushNote(elem[0], elem[1], elem['linkPrev']);
        ch.ouattach = GOUAttachment.make(elem['oum'], elem['overmarks'], elem['undermarks']);
        if (elem['acciaccatura']) {
          if (ch instanceof MChord) {
            ch._decoration = EChordDecorationType.Acciaccatura;
          }
        }
      } else if (elem instanceof Object) {
        let m = new MMark(elem.kind, elem.type);
        m.lf = elem.opt;
        m.beat = new GTimeSlice().follow(this.track._tailBar.beat)
        this.track.feed(m);
      } else if (typeof(elem) == 'number') {
        this.pushNote(elem);
      }
    }


    if (this.base) {
      this.track.shift(this.base);
    }
  }


  _settle() {
    for (let bar of this.track.bars) {
      bar._settle();
    }
  }
}
/****************************************
 *
 * PushMelody
 *
 * Params:
 *   mtrack:    Instance of MTrack
 *   content:
 *     {
 *        tone: number | string,
 *        clef: number | string,
 *        min: number,
 *        dem: number,
 *        base: number,
 *
 *        0...n: number | array | object,
 *     }
 *
 *    or
 *
 *     {
 *        score: [],
 *        param: {
 *          same as the previous one
 *        },
 *     }
 ****************************************/
function PushMelody(mtrack, content) {
  if (content['score'] instanceof Array && content['param'] instanceof Object) {
    content = content['score'];
    for (var prop in content['param']) {
      content[prop] = content['param'][prop];
    }
  }

  let feeder = new MTrackFeeder(mtrack);
  feeder.preset(content);
  feeder.feed(content);
  feeder._settle();

}

function DumpMTrack(mtrack, ops) {
  // TODO():
  var bar = mtrack._tailBar;
  var ret = {
    score: [],
    param: {
      tone: bar._clef.tone,
      clef: bar._clef.type,
      min: bar._timeBeat.numerator,
      dem: bar._timeBeat.denominator,
    }
  };

  //ret.param.tone = bar._clef.tone;
  //ret.param.clef = bar._clef.type;
  //ret.param.min = bar._timeBeat.numerator;
  //ret.param.dem = bar._timeBeat.denominator;
  //ret.param.base = number,

  return ret;
}
