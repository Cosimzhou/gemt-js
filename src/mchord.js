
/********************************
 *
 * MChord
 * @constructor
 *
 *
 *******************************/
function MChord() {
  this.notes = Array.from(arguments);
  this.info = "";
  this.tone = 0;
  this.nths = [1];
}
exports['MChord'] = MChord;
MChord.prototype.clone = function() {
  var nmc = new MChord();
  for (var n of this.notes) {
    nmc.notes.push(n.clone());
  }
  nmc.info = this.info;
  nmc.tone = this.tone;
  nmc.beat = this.beat.clone();
  return nmc;
}
MChord.prototype.linkWith = function(mchord) {
  if (this.link == null) {
    var linkObj = {start: [mchord], end: this};
    this.link = linkObj;
    mchord.link = linkObj;
  } else {
    this.link.start.push(mchord);
    mchord.link = this.link;
  }
}
// 生成和弦的特征
MChord.prototype._charactorize = function(){
  var n = 0;
  for (var e of this.notes) {
    n |= 1<<(e.pitch%12);
  }
  return n;
}
MChord.prototype.analysis = function(){
  var ck = this._charactorize();
  var ck1 = ck & (ck-1);
  if (ck1 == 0) {
    // single note pitch
    this.tone = this.notes[0].pitch%12;
    this.info = MConst.ToneList[this.tone]+"音";
  } else {
    for (var i = 0; i < 12; i++) {
      for (var e of MConst.ChordsInfo) {
        if (ck == e[0]) {
          this.tone = i;
          this.info = MConst.ToneList[i] + "调" + e[2];
          return;
        }
      }
      ck = (ck>>1)|(ck&1?0x800:0);
    }

    if ((ck1 & (ck1-1)) == 0) {
      //this.notes.sort(function(a,b){return a.pitch-b.pitch});
      var diff = this.notes[0].pitch - this.notes[1].pitch;
      if (diff > 0) {
        this.tone = this.notes[1].pitch;
        this.info = this.notes[1].tone() + "+" +MConst.DegreeList[diff][1];
      } else {
        this.tone = this.notes[0].pitch;
        this.info = this.notes[0].tone() + "+" +MConst.DegreeList[-diff%12][1];
      }
      return;
    }
  }
}

/********************************
 *
 * 和弦统一移调
 *******************************/
MChord.prototype.shift = function(n) {
  for (var e, i = 0; e = this.notes[i]; ++i)
    e.pitch += n;
}

/********************************
 * 计算拍子
 *******************************/
MChord.prototype.nth = function(){
  var beat = this.beat.beatlen;
  var nth = 4 / beat;
  return nth;
}
