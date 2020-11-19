/********************************
 *
 * GContext
 *
 * @constructor
 *******************************/
function GContext(ctx) {
  this.ops = [];
  this.segs = [];
  this.context2D = ctx;
}
exports.GContext = GContext;

GContext.prototype.context = function() {
  return this.context2D;
}

GContext.prototype.strokes = function() {
  return this.ops;
}

GContext.prototype.beginBudget = function(w, h) {
  this.height = h;
  this._grid = new GGrid(w, h);
}

GContext.prototype.pageCount = function() {
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

GContext.prototype._line = function(x, y, x1, y1) {
  return new GStroke('line', x, y, x1, y1);
}

GContext.prototype._curve = function(x, y, x1, y1, w) {
  return new GStroke('curve', x, y, x1, y1, w);
}

GContext.prototype._charCurve = function(x, y, x1, y1, w) {
  return new GStroke('ccurve', x, y, x1, y1, w);
}

GContext.prototype._lineWh = function(x, y, x1, y1, w) {
  // use for beam
  return new GStroke('lineH', x, y, x1, y1, w);
}

GContext.prototype._lineWv = function(x, y, x1, y1, w) {
  return new GStroke('lineV', x, y, x1, y1, w);
}

GContext.prototype._vline = function(x, y, h) {
  return new GStroke('vline', x, y, h);
}

GContext.prototype._Vline = function(x, y, y1) {
  // use for EBarline
  return new GStroke('Vline', x, y, y1);
}

GContext.prototype._VlineW = function(x, y, y1, w) {
  // use for EBarline, substitution of rect
  return new GStroke('Vlinew', x, y, y1, w);
}

GContext.prototype._hline = function(x, y, w) {
  return new GStroke('hline', x, y, w);
}

GContext.prototype._rect = function(x, y, w, h) {
  return new GStroke('rect', x, y, w, h);
}

GContext.prototype._dot = function(x, y, r) {
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

GContext.prototype._attach = function() {

}

GContext.prototype.shift = function(ops, vx, vy, si=0, ei=null) {
  if (ei == null) ei = ops.length;

  for (var e, i = si; i < ei; ++i) {
    ops[i]._settle(
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
    ops[i]._settle(rx);
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

GContext.prototype._settle = function(ops) {
  this.segs.push(this.ops.length);
  this.ops.push(...ops);
}

GContext.prototype.print = function(p = 0) {
  if (g_option.funcPageRender != null)
    g_option.funcPageRender(this.context2D, p);

  if (p == 0 && g_option.funcTitleRender != null)
    g_option.funcTitleRender(this.context2D, p);

  if (g_option.funcHeadRender != null)
    g_option.funcHeadRender(this.context2D, p);

  this["printImpl"](p);

  if (g_option.funcTailRender != null)
    g_option.funcTailRender(this.context2D, p);

  if (g_option.funcFootRender != null)
    g_option.funcFootRender(this.context2D, p);
}

GContext.prototype.debug = function() {
  // debug should override by G-Layer
}
