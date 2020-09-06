
/********************************
 *
 * MClef
 * 谱号
 * @constructor
 *
 *******************************/
function MClef(n, t=null) {
  this.type = n;
  this.tone = t;
  this.load();
}
exports['MClef'] = MClef;
MClef.Const = {
  GClef: 0,
  FClef: 1,
  CClef: 2,
  CClefTensor: 3,
  ova8: 0,
  ovb8: 8,
  clefRange: [
      // g-clef
      {low:64, high:77, base:67, level:4, line:3},
      // f-clef
      {low:43, high:57, base:53, level:3, line:1},
      // c-clef
      {low:53, high:67, base:60, level:0, line:2},
      // c-clef tensor
      {low:50, high:64, base:60, level:0, line:1}
  ],
};
MClef.prototype.load = function() {
  var clefData = MClef.Const.clefRange[this.type%4];
  for (var prop in clefData) this[prop] = clefData[prop];

  var off = this.type >> 4;
  if (this.type & 8) {
    off = -off;
  }
  this.base += 12*off;
  this.off = off;

  if (this.tone == null)
    return;

  var order = this.tone.noteOrder(this.base);
  if (order*2%2 == 1) {
    if (this.tone.flat) {
      order -= .5;
      this.base -= 1;
    } else {
      order += .5;
      this.base += 1;
    }
  }
  this.order = order;
  this.o8 = parseInt((this.base-this.tone.nTone)/12);
}
MClef.prototype.noteLine = function(n){
  var order = this.tone.noteOrder(n);
  var sign = null;
  if (order*2%2 == 1) {
    if (this.tone.flat) {
      order += .5;
      sign = "flat";
    } else {
      order -= .5;
      sign = "sharp";
    }
  }
  var o8 = parseInt((n-this.tone.nTone)/12);
  var diff = order - this.order + 7*(o8-this.o8);
  return [this.line - diff/2, sign];
}
MClef.prototype.lineOrder = function(l) {
  var diff = (this.line - l)*2 % 7 + this.order;
  return diff;
}
//MClef.prototype.orderLine = function(order) {
//
//}
MClef.prototype.equal = function(mc) {
  return mc.type == this.type && mc.tone.equal(this.tone);
}
MClef.prototype.convertMark = function(preClef = null){
  var ms = [];

  if (preClef == null) {
    switch (this.type) {
      case 0:
        ms.push(new EMark('g-clef', 3));
        break;
      case 1:
        ms.push(new EMark('f-clef', 1));
        break;
      case 2:
        ms.push(new EMark('c-clef', 2));
        break;
    }
    if (this.tone && this.tone.shifts.length) {
      var sym = this.tone.symbol == '#'? 'sharp': 'flat';
      for (var i = 0; i < this.tone.shifts.length; ++i) {
        var l = this.line - (this.tone.shifts[i]+7-this.level)%7/2;
        if (l >= 3) l-=3.5;
        if (l <= -1) l+=3.5;
        ms.push(new EMark(sym, l));
      }
    }
  }

  return ms;
}
MClef.prototype.countExtraLine = function(mchord) {
  if (!mchord instanceof MChord) {
    return 0;
  }

  var overline = 0, underline = 0;
  for (var n of mchord.notes) {
    if (n.pitch > this.high) {
      overline += parseInt(-this.noteLine(n.pitch));
    } else if (n.pitch < this.low){
      underline += parseInt(this.noteLine(n.pitch)-4);
    }
  }

  return overline+underline;
}

