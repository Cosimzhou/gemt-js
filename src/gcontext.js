/********************************
 *
 * GContext
 *
 * @constructor
 *******************************/
function GContext(ctx, w, h) {
  this.ops = [];
  this._context2D = ctx;
  this.cursor = 0;
  this._pageIndex = 0;
  this._segs = [];
  this._beatCursor = 0;

  //this._pageYBase = null;
  //this.rowBaselineY = null;
  //this._pageSegs = null;

  if (w != null && h != null) {
    this.beginBudget(w, h);
  }

}
exports.GContext = GContext;

GContext.prototype.context = function() {
  return this._context2D;
}

GContext.prototype.strokes = function() {
  return this.ops;
}

GContext.prototype.beginBudget = function(w, h) {
  this.width = w;
  this.height = h;
  this._grid = new GGrid(w, h);
}

GContext.prototype.rowCount = function() {
  return this.rowBaselineY.length - 1;
}

GContext.prototype.pageCount = function() {
  return this._pageYBase.length - 1;
}

GContext.prototype.pageIndex = function(pi) {
  if (pi == null) {
    return this._pageIndex;
  } else if (0 <= pi && pi < this._pageYBase.length) {
    return this._pageIndex = pi;
  }
  return null;
}

GContext.prototype.feedScore = function(score, x, y) {
  if (score instanceof TMidiConvertor) {
    score.convert();
    console.log("TMidiConvertor", score);

    score = MConvert(score);
    console.log("MConvert result:", score);
  }

  if (score instanceof MScore) {
    var mscore = score;
    console.log("MScore:", score);
    score = EConvert(mscore);
    console.log("EScore", score);
  }

  if (!(score instanceof EScore)) {
    console.error("feedScore requires MScore or EScore");
  }

  score.budget(this, x || 0, y || 0);

  console.log(this);
}

GContext.prototype._slicePages = function() {
  var arr = [0],
    yarr = [0],
    startY = 0;
  for (var i = 0; i < this.rowBaselineY.length; ++i) {
    if (this.rowBaselineY[i] - startY >= this.height) {
      arr.push(this._segs[i - 1]);
      startY = this.rowBaselineY[i - 1];
      yarr.push(startY);
    }
  }
  arr.push(this.ops.length);
  yarr.push(startY + this.height);
  this._pageSegs = arr;
  this._pageYBase = yarr;
}

GContext.prototype.getPageOpsSlice = function(p) {
  if (p >= this._pageSegs.length) {
    p = 0;
  }

  return [this._pageSegs.slice(p, p + 2), this._pageYBase[p]];
}

GContext.prototype._xmark = function(x, val, opt = null) {
  var gs = new GStroke('x', x, 0);
  gs.ext = val || 0;
  gs.opt = opt;
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

GContext.prototype.shift = function(ops, vx, vy, si = 0, ei = null) {
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

GContext.prototype._compress = function(ops, baseX, rate, si = 0, ei = null) {
  function rx(x) {
    return typeof x == 'number' ? (x - baseX) * rate + baseX : x;
  }

  if (ei == null) ei = ops.length;
  for (var i = si; i < ei; ++i) {
    ops[i]._settle(rx);
  }

  function rt(e) {
    var w = e.right - e.left;
    e.left = (e.left - baseX) * rate + baseX;
    e.right = e.left + w;
  }
  for (var i = 0; i < this._grid.array.length; ++i) {
    rt(this._grid.array[i]);
  }
}

GContext.prototype._settle = function(ops) {
  this._segs.push(this.ops.length);
  this.ops.push(...ops);
}

GContext.prototype.clear = function() {
  if (this.clearImpl) this.clearImpl();
}

GContext.prototype.print = function(pageIdx = null) {
  if (pageIdx == null) {
    if (this.isPlaying()) {
      var bpo = this.beatPositions[this.cursor - 1];
      var i, rowY = this.rowBaselineY[bpo.rowIndex];
      for (i = 0; i < this._pageYBase.length; ++i) {
        if (rowY <= this._pageYBase[i]) {
          pageIdx = i - 1;
          break;
        }
      }
      if (pageIdx == null) pageIdx = i;

      this._pageIndex = pageIdx;
    } else {
      this.cursor = 0;
      pageIdx = this._pageIndex;
    }
  } else {
    this._pageIndex = pageIdx;
  }

  if (g_option.funcPageRender != null)
    g_option.funcPageRender(this._context2D, pageIdx);

  if (pageIdx == 0 && g_option.funcTitleRender != null)
    g_option.funcTitleRender(this._context2D, pageIdx);

  if (g_option.funcHeadRender != null)
    g_option.funcHeadRender(this._context2D, pageIdx);

  this["printImpl"](pageIdx);

  if (g_option.funcTailRender != null && pageIdx == this.pageCount())
    g_option.funcTailRender(this._context2D, pageIdx);

  if (g_option.funcFootRender != null)
    g_option.funcFootRender(this._context2D, pageIdx);

  return pageIdx;
}

GContext.prototype.isPlaying = function() {
  return this.cursor > 0 && (this.cursor <= this.beatPositions.length);
}

GContext.prototype.frameNext = function() {
  var ret = false;
  this._beatCursor += 1 / 32;
  while (this.cursor < this.beatPositions.length) {
    var bpo = this.beatPositions[this.cursor];
    if (bpo.beat <= this._beatCursor) {
      this.cursor++;
      ret = true;
    } else {
      return ret;
    }
  }

  return ret;
}

GContext.prototype.debug = function() {
  // debug should override by G-Layer
}


// MakeGContext
function MakeGContext(type, width, height, options) {
  var gctx = new GContext(ctx, width, height);

  return gctx;
}
exports.MakeGContext = MakeGContext;
