/********************************
 *
 * MBar
 * @constructor
 *
 *******************************/
function MBar() {
  this._timeBeat = null;
  this.chords = [];
  this.beat = new GTimeSlice(0, 0);
}
exports.MBar = MBar;

MBar.prototype.clef = function(c) {
  if (c instanceof MClef) {
    this._clef = c;
  }
  return this._clef;
}

MBar.prototype.timeBeat = function(t) {
  if (t instanceof MBeat) {
    this._timeBeat = t;
  }
  return this._timeBeat;
}

MBar.prototype.extend = function(mtrack) {
  if (this.cap() > 0) {
    return this;
  }

  var nb = new MBar();
  nb._timeBeat = this._timeBeat;
  nb._clef = this._clef;
  nb.beat.follow(this.beat);
  mtrack.bars.push(nb);
  return nb;
}

var g_MBar_feed_NoteID = 0;
MBar.prototype.feed = function(mtrack, ch) {
  var capacity = this._timeBeat.length();
  if (this.beat.add(ch.beat) > capacity) {
    // this bar has no enough space to offer this note,
    // and split the note into pieces to settle.
    if (this.beat.beatlen < capacity) {
      var lch = ch.clone();
      this.chords.push(lch);
      lch.beat.follow(this.beat).movTo(-this.beat.sub(capacity));
      ch.beat.follow(lch.beat).subTo(lch.beat);
      lch.nths = this._timeBeat.nths(lch.beat.beatlen);

      ch.linkWith && ch.linkWith(lch, true);
    }
    this.beat.movTo(capacity);
    var nb = this.extend(mtrack);
    return nb.feed(mtrack, ch);
  } else {
    if (ch.nths == null || ch.nths.seq == null) {
      ch.nths = this._timeBeat.nths(ch.beat.beatlen);
    }
    this.chords.push(ch);
    ch.beat.follow(this.beat);
    this.beat.addTo(ch.beat);
    return this;
  }
}

MBar.prototype.append = function(ch) {
  // make sure all of MBar elements are MChore type
  if (ch instanceof MNote)
    ch = new MChord(ch);
  this.chords.push(ch);
}

var g_BarCombineID = 0;
MBar.prototype._settle = function() {
  var me = this;
  var unseq = [];
  var CompleteBeat = this._timeBeat.numerator,
    unsetBeat = CompleteBeat;
  for (var sb = 0, mch, i = 0; mch = this.chords[i]; ++i) {
    if (mch.beat._start == null) {
      mch.beat._start = sb;
    }
    if (mch.beat.beatlen == null) {
      // beatElapser
      mch.beat.beatlen = 4 / mch.nths[0];
    }
    if (mch.nths.seq == null) {
      unseq.push(i);
    } else {
      unsetBeat = -mch.beat.sub(unsetBeat);
    }

    if (mch instanceof MRest) {
      if (mch.beat._start != null)
        sb = mch.beat._start;
      if (mch.nths.length > 1) {
        while (mch.nths.length > 1) {
          var rest = new MRest();
          rest.nths = [mch.nths.shift()];
          rest.beat = new GTimeSlice(4 / rest.nths[0], sb);
          this.chords.splice(i++, 0, rest);
          sb = rest.beat.endBeat();
        }
        //TODO:
        mch.beat._start = sb;
        //mch.beat.movTo(mch.endBeat - mch.startBeat);
      } else {
        mch.beat._start = sb;
      }
    }

    sb = mch.beat.add(sb);
  }

  if (this.beat.less(CompleteBeat)) {
    var diffBeat = -this.beat.sub(CompleteBeat);
    if (diffBeat > 1) {
      diffBeat -= parseInt(diffBeat);
    }
    if (diffBeat < 0.1) {
      this.chords[this.chords.length - 1].beat.addTo(diffBeat);
      this.beat.addTo(diffBeat);
    }
    if (this.beat.less(CompleteBeat) && !this._timeBeat._unlimited()) {
      var beatlen = -this.beat.sub(CompleteBeat);
      var rest = new MRest(this._timeBeat.nths(beatlen)[0]);
      rest.beat = new GTimeSlice(beatlen).follow(this.chords[this.chords
        .length - 1].beat);
      rest.nths = this._timeBeat.nths(rest.beat.beatlen);
      this.chords.push(rest);
    }
  }

  if (unseq.length > 0) {
    function reassign(schi, schn) {
      var sebeat = me.chords[schi + schn].beat.endBeat() - me.chords[schi]
        .beat._start;
      var exception = 0;

      // strategy 1
      var avgbeat = sebeat / (schn + 1);
      for (var rate, i = 0; i <= schn; ++i) {
        rate = me.chords[i + schi].beat.beatlen / avgbeat - 1;
        if (-0.2 < rate && rate < 0.25) {

        } else {
          exception++;
          break;
        }
      }

      if (exception == 0) {
        for (var i = 0; i <= schn; ++i) {
          var mch = me.chords[schi + i];
          mch.beat.movTo(avgbeat);
          //mch.endBeat = mch.startBeat + avgbeat;
          mch.nths = me._timeBeat.nths(mch.beat.beatlen);
          if (i < schn) me.chords[schi + i + 1].beat.follow(mch.beat);
        }
        unsetBeat -= sebeat;
        return;
      }

      // strategy 2
      if (schn == 1) {

      }

      //console.log(schi, schn, sebeat, ...me.chords.slice(schi, schi+schn+1));
    }
    for (var schi = unseq[0], schn = 0, i = 1; i < unseq.length; ++i) {
      if (schi + schn + 1 == unseq[i]) {
        schn++;
      } else {
        reassign(schi, schn);
        schi = unseq[i];
        schn = 0;
      }
    }
    reassign(schi, schn);

    //unsetBeat =
  }


  // _beamCombine the 8th or shorter note togather.
  var linkArr = [];
  for (var mch, i = 0; mch = this.chords[i]; ++i) {
    if (mch instanceof MChord && mch.nths[0] > 4) {
      linkArr.push(i);
    }
  }

  function dealBeams(sb, n) {
    if (n == 0) return;
    var mch = me.chords[sb],
      nthlines = [],
      och = mch;
    mch._beamCombine = {
      _beamPhase: 0,
      id: ++g_BarCombineID
    };
    nthlines.push(Log2(mch.nths[0]) - 3);
    while (n-- > 0) {
      mch = me.chords[++sb];
      mch._beamCombine = {
        _beamPhase: (n ? 1 : 2),
        id: g_BarCombineID
      };
      nthlines.push(Log2(mch.nths[0]) - 3);
    }
    var max = Math.max(...nthlines);

    if (max > 0) {
      // deal with the multi-beam matter
      var dislen = Array(max);
      for (var dis = [], l = 1; l <= max; ++l) {
        for (var i = 0; i < nthlines.length; ++i) {
          if (nthlines[i] < l) continue;
          if (dis.length == 0) {
            dis.push(i, i);
          } else if (dis[dis.length - 1] == i - 1) {
            dis[dis.length - 1] = i;
          } else {
            dis.push(i, i);
          }
        }
        dislen[l - 1] = dis;
      }
      och._beamCombine._subBeamLayout = dislen;
    }
  }

  if (linkArr.length > 1) {
    // deal some combined beam
    var n = 0,
      b = linkArr[0],
      sb = b;
    for (var cb, i = 1; i < linkArr.length; b = cb, i++) {
      cb = linkArr[i];
      if (b + 1 == cb &&
        (Math.floor(this.chords[b].beat._start) == Math.floor(this.chords[cb]
            .beat._start) &&
          Math.ceil(this.chords[b].beat.endBeat()) == Math.ceil(this.chords[
            cb].beat.endBeat()))) {
        ++n;
        continue;
      }
      dealBeams(sb, n);
      n = 0, sb = cb;
    }
    dealBeams(sb, n);
  }
}

MBar.prototype.cap = function() {
  return this._timeBeat.length() - this.beat.beatlen;
}
