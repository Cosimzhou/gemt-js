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
  var tone = content['tone'] || 0,
    clef = content['clef'] || 0;
  mtrack._tailBar.clef = new MClef(clef, new MTone(tone));

  var min = content['min'] || 2,
    dem = content['dem'] || 4;
  mtrack._tailBar.timeBeat = new MBeat(min, dem);

  function makeNote(x) {
    return new MNote(x);
  }

  function makeNoteIn7(x) {
    var idx = x % 10;
    var n = Math.trunc(x / 10);
    if (idx < 0) {
      n--;
      x = -idx;
    } else {
      x = idx;
    }
    x--;
    n = n * 12 + x * 2;
    if (x >= 3) {
      n--;
    }
    return new MNote(n);
  }
  var mabs = !content['abs'];
  var make_note = mabs ? makeNoteIn7 : makeNote;

  function pushNote(notes, timeBeat: Array<number>|number = 4, linkToObjIdx = null) {
    var ch;
    if (notes == null || (notes == 0 && mabs)) {
      if (typeof timeBeat === 'number')
        ch = new MRest(timeBeat);
      else
        console.error('');
    } else {
      if (notes instanceof Array) {
        ch = new MChord(...notes.map(make_note));
      } else {
        ch = new MChord(make_note(notes));
      }

      // link
      if (linkToObjIdx != null) {
        var bidx = mtrack.bars.length - 1;
        while (linkToObjIdx > 0 && bidx >= 0) {
          var chds = mtrack.bars[bidx].chords;
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
        ch.beat.addTo(mtrack.currentBeat.denominator / tb);
      }
      ch.nths = new MBeatSequence(timeBeat);
      // tuplet sound
      if (timeBeat['tuplet']) {
        ch.beat.movTo(0);
        ch.nths.seq = timeBeat['tuplet'];
      }
    } else if (typeof(timeBeat) == 'number') {
      ch.beat.movTo(mtrack.currentBeat.denominator / timeBeat);
    } else {
      console.error();
    }
    mtrack.feed(ch);
    return ch;
  }

  // Pickup bar
  if (content['pickup']) {
    //  mtrack._tailBar.pickup = content['pickup'];
    mtrack._tailBar.beat.beatlen = content['pickup'];
  }

  for (var elem of content) {
    if (elem instanceof Array) {
      var ch = pushNote(elem[0], elem[1], elem['linkPrev']);
      ch.ouattach = GOUAttachment.make(elem['oum'], elem['overmarks'], elem['undermarks']);
    } else if (elem instanceof Object) {
      var m = new MMark(elem.kind, elem.type);
      m.lf = elem.opt;
      m.beat = new GTimeSlice().follow(mtrack._tailBar.beat)
      mtrack.feed(m);
    } else if (typeof(elem) == 'number') {
      pushNote(elem);
    }
  }

  var base = content['base'] || 60;
  if (base) {
    mtrack.shift(base);
  }

  for (var bar of mtrack.bars) {
    bar._settle();
  }
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
