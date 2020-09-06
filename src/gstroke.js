
/***************************************
 *
 * GStroke
 *      笔划类，用于描述基本笔划
 *
 * Args:
 *      [0] kind
 *      [1] x
 *      [2] y
 *      [...] other args
 *
 ***************************************/

function GStroke() {
  var ops = [...arguments];
  this.kind = ops.shift();
  this.x = ops.shift();
  this.y = ops.shift();
  this.args = ops;
}
exports['GStroke'] = GStroke;
GStroke.Const = {
  ConstraintX:                1,
  ConstraintX2:               2,
  ConstraintParallelHorizon:  4,
  ConstraintY2:               8,
};
GStroke.prototype.attach = function(obj, offsetX = 0, flag = null) {
  if (this.fix == null) {
    this.fix = {constraints: []};
  }

  this.fix.constraints.push({
    ox: offsetX,
    flag: (flag != null ? flag : this.fix.constraints.length + 1),
    obj: obj
  });
  return this;
}
GStroke.prototype.detach = function(flag) {
  if (this.fix == null) {
    return this;
  }

  var len = this.fix.constraints.length;
  for (var i = 0; i < len; i++) {
    if (this.fix.constraints[i].flag == flag) {
      this.fix.constraints[i--] = this.fix.constraints[--len];
    }
  }

  if (len) {
    var howmany = this.fix.constraints.length - len;
    if (howmany > 0) {
      this.fix.constraints.splice(len, howmany);
    }
  } else {
    delete this.fix;
  }
  return this;
}
GStroke.prototype.settle = function(fn, fny = null) {
  if (fn) this.x = fn(this.x);
  if (fny) this.y = fny(this.y);

  switch(this.kind){
    case 'line':
    case 'lineH':
    case 'lineV':
    case 'curve':
    case 'ccurve':
      if (fn) this.args[0] = fn(this.args[0]);
      if (fny) this.args[1] = fny(this.args[1]);
      break;
    case 'Vline':
    case 'Vlinew':
      if (fny) this.args[0] = fny(this.args[0]);
    default:
      break;
  }

  if (this.fix == null || this.fix.constraints == null) {
    return;
  }

  for (var con, i = 0; con = this.fix.constraints[i]; i++) {
    if (con.flag & 1) { // GStroke.Const.ConstraintX
      this.x = con.ox + con.obj.x;
    }
    if (con.flag & 2) { // GStroke.Const.ConstraintX2
      this.args[0] = con.ox + con.obj.x;
    }
    if (con.flag & 4) { // GStroke.Const.ConstraintParallelHorizon
      // assert this.kind == 'lineH' and con.obj.kind == 'lineH'
      // special treat for parallel horizontal lines

      var ow = con.obj.args[0] - con.obj.x, oh = con.obj.args[1] - con.obj.y;
      var k = oh / ow,
          b = con.obj.y - con.obj.x * k +
          (con.ox > 0 ? con.obj.args[2] : -this.args[2]) +
          con.ox / Math.sqrt(1 + k * k);
      this.y = k * this.x + b;
      this.args[1] = k * this.args[0] + b;
    }
    if (con.flag & 8) { // GStroke.Const.ConstraintY2
      // assert this.kind == 'Vline'
      this.args[0] = con.ox + con.obj.y;
    }
  }
}
GStroke.prototype.rightX = function() {
  //return this.kind=='rect'? this.x+this.args[0]: this.x;
  return this.x;
}

GStroke.prototype.curveArgs = function() {
  if (this.kind.substring(this.kind.length-5) != 'curve') {
    return null;
  }

  var op = this;
  var args = Array(2);
  var Dx = op.args[0], Dy = op.args[1];
  var dx = (Dx-op.x)/3, dy = (Dy-op.y)/3;
  var dist = Math.sqrt(dx*dx+dy*dy), epsilon = Math.asin((dist/2-(op.args[2]||1))/dist);
  var theta = Math.PI/6;
  if (epsilon*2 < theta) epsilon = theta/2;
  // Stroke the outer front half curve
  var x = dx*Math.cos(theta) + dy*Math.sin(theta),
      y = -dx*Math.sin(theta) + dy*Math.cos(theta);
  // Stroke the outer post half curve
  theta = Math.PI - theta;
  var x1 =dx*Math.cos(theta) + dy*Math.sin(theta),
      y1 =-dx*Math.sin(theta) + dy*Math.cos(theta);
  args[0] = [op.x+x, op.y+y, Dx+x1, Dy+y1, Dx, Dy];

  // Stroke the inner post half curve
  theta = epsilon;
  x = dx*Math.cos(theta) + dy*Math.sin(theta),
  y = -dx*Math.sin(theta) + dy*Math.cos(theta);
  // Stroke the inner front half curve
  theta = Math.PI - theta;
  x1 =dx*Math.cos(theta) + dy*Math.sin(theta),
  y1 =-dx*Math.sin(theta) + dy*Math.cos(theta);
  args[1] = [Dx+x1, Dy+y1, op.x+x, op.y+y, op.x, op.y];

  return args;
}

function GContext(ctx) {
  this.ops = [];
  this.segs = [];
  this.context2D = ctx;
}
exports['GContext'] = GContext;
GContext.prototype['beginBudget'] = function(w, h) {
  this.height = h;
  this._grid = new GGrid(w, h);
}
GContext.prototype['pageCount'] = function() {
  return this.pageYBase.length-1;
}
GContext.prototype.seg = function() {
  this.segs.push(this.ops.length);
}
GContext.prototype.slicePages = function() {
  var arr = [0], yarr = [0], startY = 0;
  for (var i = 0; i < this.rowBaselineY.length; ++i) {
    if (this.rowBaselineY[i]- startY >= this.height) {
      arr.push(this.segs[i-1]);
      startY = this.rowBaselineY[i-1];
      yarr.push(startY);
    }
  }
  arr.push(this.ops.length);
  yarr.push(startY);
  this.pageSegs = arr;
  this.pageYBase = yarr;
}
GContext.prototype.getPageOpsSlice = function(p) {
  if (p >= this.pageSegs.length) {
    p = 0;
  }
  return [this.pageSegs.slice(p, p+2), this.pageYBase[p]];
}
GContext.prototype._xmark = function(x, val) {
  var gs = new GStroke('x', x, 0);
  gs.ext = val||0;
  return gs;
}
GContext.prototype._line = function(x,y,x1,y1) {
  return new GStroke('line', x, y, x1, y1);
}
GContext.prototype._curve = function(x,y,x1,y1,w) {
  return new GStroke('curve', x, y, x1, y1, w);
}
GContext.prototype._charCurve = function(x,y,x1,y1,w) {
  return new GStroke('ccurve', x, y, x1, y1, w);
}
GContext.prototype._lineWh = function(x,y,x1,y1, w) {
  // use for beam
  return new GStroke('lineH', x, y, x1, y1, w);
}
GContext.prototype._lineWv = function(x,y,x1,y1, w) {
  return new GStroke('lineV', x, y, x1, y1, w);
}
GContext.prototype._vline = function(x,y,h) {
  return new GStroke('vline', x, y, h);
}
GContext.prototype._Vline = function(x,y,y1) {
  // use for EBarline
  return new GStroke('Vline', x, y, y1);
}
GContext.prototype._VlineW = function(x,y,y1,w) {
  // use for EBarline, substitution of rect
  return new GStroke('Vlinew', x, y, y1, w);
}
GContext.prototype._hline = function(x,y,w) {
  return new GStroke('hline', x, y, w);
}
GContext.prototype._rect = function(x,y,w,h) {
  return new GStroke('rect', x, y, w, h);
}
GContext.prototype._dot = function(x,y,r) {
  return new GStroke('dot', x, y, r);
}
GContext.prototype._draw = function(name, x, y, w, h) {
  return new GStroke('draw', x, y, w, h, name);
}
GContext.prototype._text = function(name, x, y, w, h) {
  return new GStroke('text', x, y, w, h, name);
}
GContext.prototype._char = function(name, x, y, w, h) {
  return new GStroke('char', x, y, w, h, name);
}

GContext.prototype.attach = function() {

}

GContext.prototype.shift = function(ops, vx, vy, si=0, ei=null) {
  if (ei == null) ei = ops.length;

  for (var e, i = si; i < ei; ++i) {
    ops[i].settle(
        function(x) {
          return x + vx;
        },
        function(y) {
          return y + vy;
        });
  }
}
GContext.prototype.compress = function(ops, baseX, aimWidth, ubound, si=0, ei=null) {
  var me = this, rate = aimWidth/ubound;
  function rx(x) {
    return typeof x == 'number'? (x-baseX)*rate+baseX: x;
  }
  if (ei == null) ei = ops.length;
  var debug = ops[ei-1].x;
  for (var i = si; i < ei; ++i) {
    ops[i].settle(rx);
  }

  function rt(e) {
    var w = e.right - e.left;
    e.left = (e.left-baseX)*rate+baseX;
    e.right = e.left+w;
  }
  for (var i = 0; i < this._grid.array.length; ++i) {
    rt(this._grid.array[i]);
  }
}
GContext.prototype.settle = function(ops) {
  this.segs.push(this.ops.length);
  this.ops.push(...ops);
}
GContext.prototype.print = function() {
  // print should override by G-Layer
}
GContext.prototype.debug = function() {
  // debug should override by G-Layer
}
