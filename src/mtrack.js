/********************************
 *
 * MTrack
 * @constructor
 *
 *******************************/
function MTrack() {
  this.tone = null;
  this.noteMax = 0;
  this.noteMin = Infinity;

  this.bars = [];
}
exports['MTrack'] = MTrack;
MTrack.prototype.append = function(b) {
  //assert (b instanceof MBar);
  //b.settle();
  this.bars.push(b);
}
/********************************
 *
 *  detectClef
 *
 *******************************/
MTrack.prototype.detectClef = function() {
  for (var clef, b, i = 0; b = this.bars[i]; ++i) {

  }
}


MTrack.prototype.assignClef = function(keySign){
  for (var b, i = 0; b = this.bars[i]; ++i) {

  }
}
MTrack.prototype.shift = function(d) {
  for (var b, i = 0; b = this.bars[i]; ++i) {
    for (var ch, j = 0; ch = b.chords[j]; ++j) {
      if (ch instanceof MChord) ch.shift(d);
    }
  }
}
MTrack.prototype.analysis = function(){
  // clef   h    b   a
  // g clef 67   64  77
  // c clef 60   53  67
  // f clef 53   43  57
  var gclefh = 67, cclefh = 60, fclefh = 53;

  var tenser = new MToneTenser();
  var tensers = [], preten, sorbarn = 0;
  tenser.barn = 0;
  for (var b, bn = 0, i = 0; b = this.bars[i]; ++i, ++bn) {
    if (bn >= 4) {
      if (tenser.conclude()) {
        if (preten && preten.join(tenser)) {

        } else {
          tensers.push(preten = tenser);
          tenser = new MToneTenser();
          tenser.barn =sorbarn = i;
        }
        bn = 0;
      }
    }

    for (var ch, j = 0; ch = b.chords[j]; ++j) {
      if (ch instanceof MChord) {
        for (var n, k = 0; n = ch.notes[k]; ++k) {
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

  var bt = tensers[0], newtenser = [bt];
  for (var bt1, i = 1; bt1 = tensers[i]; ++i) {
      if (!bt.join(bt1)) {
          if (bt.candidate == null) continue;
          if (bt.candidate && bt.candidate.size == 1) {
          }
          bt.clef = new MClef(bt.clef, new MTone(Array.from(bt.candidate)[0]));
          bt = bt1;
          newtenser.push(bt);
      }
  }
  bt.clef = new MClef(bt.clef, new MTone(Array.from(bt.candidate)[0]));
  tensers = newtenser;

  for (var ccf = tensers[0].clef, ncfi = 1, i = 0, b;
      b = this.bars[i]; ++i) {
      if (tensers[ncfi] && i >= tensers[ncfi].barn) {
          ccf = tensers[ncfi++].clef;
      }
      b.clef = ccf;
  }
  //console.log(tensers);
  for (var b, i = 0; b = this.bars[i]; ++i) {

  }
}

