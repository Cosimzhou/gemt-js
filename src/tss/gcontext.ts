/********************************
 *
 * GContext
 *
 * @constructor
 *******************************/

class GContext {
  width: number
  height: number
  cursor : number
  ops: Array<GStroke>

  _context2D : object
  _pageIndex : number
  _beatCursor : number
  _segs: Array<number>
  _grid: GGrid
  rowBaselineY: Array<number>
  _pageYBase: Array<number>
  _pageSegs: Array<number>
  beatPositions: Array<GBeatInfo>
  rowOriginPoint: GPoint

  clearImpl: ()=>void
  printImpl: (p?: number)=>void

  constructor(ctx: object, w:number, h:number) {
    this.ops = [];
    this._context2D = ctx;
    this.cursor = 0;
    this._pageIndex = 0;
    this._segs = [];
    this._beatCursor = 0;

    if (w != null && h != null) {
      this.beginBudget(w, h);
    }
  }

  context (): object {
    return this._context2D;
  }

  strokes(): Array<GStroke> {
    return this.ops;
  }

  beginBudget(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this._grid = new GGrid(w, h);
  }

  rowCount(): number {
    return this.rowBaselineY.length - 1;
  }

  pageCount(): number {
    return this._pageYBase.length - 1;
  }

  get pageIndex():number { return this._pageIndex; }
  set pageIndex(pi: number) {
    if (0 <= pi && pi < this._pageYBase.length) {
      this._pageIndex = pi;
    }
  }

  feedScore(score, x: number, y: number): void {
    // temporary remarked
    //
    if (score instanceof TMidiConvertor) {
      score.convert();
      console.log("TMidiConvertor", score);

      score = MConvert(score);
      console.log("MConvert result:", score);
    }

    if (score instanceof MScore) {
      let mscore = score;
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

  _slicePages(): void {
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

  getPageOpsSlice(p: number): Array<any> {
    if (p >= this._pageSegs.length) {
      p = 0;
    }

    return [this._pageSegs.slice(p, p + 2), this._pageYBase[p]];
  }

  _xmark(x: number, val, opt: object = null): GStroke {
    var gs = new GStroke('x', x, 0);
    gs.ext = val || 0;
    gs.opt = opt;
    return gs;
  }

  _line(x: number, y: number, x1: number, y1: number): GStroke {
    return new GStroke('line', x, y, x1, y1);
  }

  _curve(x: number, y: number, x1: number, y1: number, w: number): GStroke {
    return new GStroke('curve', x, y, x1, y1, w);
  }

  _charCurve(x: number, y: number, x1: number, y1: number, w: number): GStroke {
    return new GStroke('ccurve', x, y, x1, y1, w);
  }

  _lineWh(x: number, y: number, x1: number, y1: number, w: number): GStroke {
    // use for beam
    return new GStroke('lineH', x, y, x1, y1, w);
  }

  _lineWv(x: number, y: number, x1: number, y1: number, w: number): GStroke {
    return new GStroke('lineV', x, y, x1, y1, w);
  }

  _vline(x: number, y: number, h: number): GStroke {
    return new GStroke('vline', x, y, h);
  }

  _Vline(x: number, y: number, y1: number): GStroke {
    // use for EBarline
    return new GStroke('Vline', x, y, y1);
  }

  _VlineW(x: number, y: number, y1: number, w: number): GStroke {
    // use for EBarline, substitution of rect
    return new GStroke('Vlinew', x, y, y1, w);
  }

  _hline(x: number, y: number, w: number): GStroke {
    return new GStroke('hline', x, y, w);
  }

  _rect(x: number, y: number, w: number, h: number): GStroke {
    return new GStroke('rect', x, y, w, h);
  }

  _dot(x: number, y: number, r: number): GStroke {
    return new GStroke('dot', x, y, r);
  }

  _draw(name: string, x: number, y: number, w?: number, h?: number): GStroke {
    return new GStroke('draw', x, y, w, h, name);
  }

  _text(name: string, x: number, y: number, w?: number, h?: number): GStroke {
    return new GStroke('text', x, y, w, h, name);
  }

  _char(name: string, x: number, y: number, w: number, h: number): GStroke {
    return new GStroke('char', x, y, w, h, name);
  }

  shift(ops, vx: number, vy: number, si: number = 0, ei: number = null): void {
    if (ei == null) ei = ops.length;

    for (let i = si; i < ei; ++i) {
      ops[i]._settle(
        (x: number): number => x + vx,
        (y: number): number => y + vy);
    }
  }

  _compress(ops, baseX: number, rate: number, si: number = 0, ei: number = null) {
    function rx(x) {
      return typeof x == 'number' ? (x - baseX) * rate + baseX : x;
    }

    if (ei == null) ei = ops.length;
    for (let i = si; i < ei; ++i) {
      ops[i]._settle(rx);
    }

    function rt(e) {
      var w = e.right - e.left;
      e.left = (e.left - baseX) * rate + baseX;
      e.right = e.left + w;
    }
    for (let i = 0; i < this._grid.array.length; ++i) {
      rt(this._grid.array[i]);
    }
  }

  _settle(ops): void {
    this._segs.push(this.ops.length);
    this.ops.push(...ops);
  }

  clear(): void {
    if (this.clearImpl) this.clearImpl();
  }

  print(pageIdx: number = null): number {
    if (pageIdx == null) {
      if (this.isPlaying) {
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

    this.printImpl(pageIdx);

    if (g_option.funcTailRender != null && pageIdx == this.pageCount())
      g_option.funcTailRender(this._context2D, pageIdx);

    if (g_option.funcFootRender != null)
      g_option.funcFootRender(this._context2D, pageIdx);

    return pageIdx;
  }

  get isPlaying(): boolean {
    return this.cursor > 0 && (this.cursor <= this.beatPositions.length);
  }

  get isOver(): boolean {
    var bp = this.beatPositions[this.beatPositions.length - 1];
    if (bp != null) {
      return this._beatCursor >= bp.beat+1;
    }
    return false;
  }

  frameNext(): boolean {
    var ret = false;
    this._beatCursor += 1;
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

  frameRefresh(beat?: number): boolean {
    if (beat != null) this._beatCursor = beat;
    var l = 0, h = this.beatPositions.length;
    var cursor = 0;
    while (l < h - 1) {
      let m = (l + h) >> 1;
      let bpo = this.beatPositions[m];
      if (bpo.beat === this._beatCursor) {
        l = m;
        break;
      } else if (bpo.beat > this._beatCursor) {
        h = m;
      } else {
        l = m;
      }
    }

    if (++l != this.cursor) {
      this.cursor = l;
      return true;
    }

    return false;
  }

  rewind(): void {
    this._beatCursor = 0;
  }

  debug(): void {
    // debug should override by G-Layer
  }

}

function MakeGContext(ctx: object , width: number, height: number, options) {
  var gctx = new GContext(ctx, width, height);

  // TODO(): ...
  return gctx;
}


const gEID = {
    "g-clef": { id: "clef_g", ay: 32, w: 20, h: 52 },
    "f-clef": { id: "clef_f", ay: 7, w: 21.6, h: 24 },
    "c-clef": { id: "clef_c", ay: 15.25, w: 21.7, h: 31.5 },

    "sharp": { id: "sharp", ay: 8, w: 5.48, h: 14.93 },
    "flat": { id: "flat", ay: 8, w: 5.03, h: 12.98 },
    "natural": { id: "natural", ay: 8, w: 3.62, h: 15.2 },

    "rest-4": { id: "rest_4th", ay: 13, w: 8, h: 24 },
    "rest-8": { id: "rest_8th", ay: 8, w: 10, h: 18 },
    "rest-16": { id: "rest_16th", ay: 8, w: 10, h: 18 },
    "rest-32": { id: "rest_32th", ay: 8, w: 10, h: 18 },

    "note": { id: "note_4th", ay: 3.42, w: 8.16, h: 6.84 },
    "note2": { id: "note_2th", ay: 3.78, w: 9.01, h: 7.56 },
    "fullnote": { id: "note_full", ax: 0.8, ay: 4, w: 12.6, h: 8.1 },

    "noteflag-d": { id: "note_flag-down", ay: 20, w: 8, h: 20.8 },
    "noteflag": { id: "note_flag-up", ay: 0.5, w: 8, h: 20.8 },

    "fermata": { id: "fermata", ax: 0.8, ay: 5, w: 17, h: 12 },
    "segno": {id: "segno_teken", w: 10, h: 18},

    "num-0": { id: "num-0", w: 12.5, h: 17.5 },
    "num-1": { id: "num-1", w: 12.5, h: 17.5 },
    "num-2": { id: "num-2", w: 12.5, h: 17.5 },
    "num-3": { id: "num-3", w: 12.5, h: 17.5 },
    "num-4": { id: "num-4", w: 12.5, h: 17.5 },
    "num-5": { id: "num-5", w: 12.5, h: 17.5 },
    "num-6": { id: "num-6", w: 12.5, h: 17.5 },
    "num-7": { id: "num-7", w: 12.5, h: 17.5 },
    "num-8": { id: "num-8", w: 12.5, h: 17.5 },
    "num-9": { id: "num-9", w: 12.5, h: 17.5 },

    "brace": { id: "brace", w: 8, h: 82 },
    "mordant": { id: "mordant", w: 13, h: 6 },
    "mordant_lower": { id: "mordant_lower", w: 13, h: 6 },
    "mordant_long": { id: "mordant_long", w: 18, h: 6 },
    "cadence": { id: "cadence", w: 14.5, h: 6.5 },
  };

  //<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="10" height="8.77">
  //  <path transform="matrix(0.0044,0,0,-0.0044,0,0.796399923)"

if (1) {
  function createSvgElement(type) {
    return document.createElementNS('http://www.w3.org/2000/svg', type);
  }

  function curve(ctx, op) {
    function curvepath(array) {
      var msg = "";
      for (var i = 0; i < 6; i += 2) {
        msg += array[i] + "," + array[i + 1] + " ";
      }
      return msg;
    }

    var args = op.curveArgs();
    var use = createSvgElement('path');
    use.setAttribute("d", "M " + op.x + "," + op.y + " C " + curvepath(
      args[0]) + "C " + curvepath(args[1]) + "z");
    use.style.fill = "currentColor";
    use.style.stroke = "currentColor";

    use.setAttribute("clip-path", "url(#pageClipPath)");
    ctx.appendChild(use);
  }


  GContext.prototype.debug = function() {}

  GContext.prototype.clearImpl = function() {
    var ctx = this.context();
    if (ctx && ctx.children) {
      for (var i = ctx.children.length - 1; i > 0; --i) {
        ctx.removeChild(ctx.children[i]);
      }
    }

    //if (ctx && ctx.querySelector) {
    //  var array = ctx.querySelectorAll(".score-page");
    //  if (array && array.length > 0) {
    //    for (var elem of array) {
    //      ctx.removeChild(elem);
    //    }
    //  }
    //}
  }

  GContext.prototype.printImpl = function(p: number): void {
    var ctx = this.context();
    var range = this.getPageOpsSlice(p);
    var page = createSvgElement('g');

    var rect;
    var path = ctx.children[0].querySelector("#pageClipPath");
    if (path == null) {
      path = createSvgElement('clipPath');
      path.setAttribute('id', 'pageClipPath');
      rect = createSvgElement('rect');
      path.appendChild(rect);
      ctx.children[0].appendChild(path);
    } else {
      rect = path.children[0];
    }

    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute("transform", "translate(0," + (range[1]) + ")");
    rect.setAttribute('width', this.width);
    rect.setAttribute('height', this.height);


    page.id = "page-" + p;
    page.setAttribute("class", "score-page");
    page.setAttribute("transform", "translate(0," + (-range[1]) + ")");
    ctx.appendChild(page);

    for (var i = range[0][0], ops = this.strokes(); i < range[0][1]; ++i) {
      let strk, op = ops[i].symbol();
      switch (op.kind) {
        case 'line':
          strk = createSvgElement('line');
          strk.setAttribute("x1", op.x);
          strk.setAttribute("y1", op.y);
          strk.setAttribute("x2", op.args[0]);
          strk.setAttribute("y2", op.args[1]);
          page.appendChild(strk);
          break;
        case 'hline':
          strk = createSvgElement('line');
          strk.setAttribute("x1", op.x);
          strk.setAttribute("y1", op.y);
          strk.setAttribute("x2", op.x + op.args[0]);
          strk.setAttribute("y2", op.y);
          strk.style.stroke = "black";
          strk.style.strokeWidth = "1";
          page.appendChild(strk);
          break;
        case 'lineH':
          strk = createSvgElement('path');
          strk.setAttribute("d", "M " + op.x + "," + op.y + " L" + op.args[
              0] + "," + op.args[1] + " v" + op.args[2] + " L " + op.x +
            "," + (op.y + op.args[2]) + "z");
          strk.style.fill = "currentColor";
          strk.style.stroke = "currentColor";
          page.appendChild(strk);
          break;
        case 'Vline':
          strk = createSvgElement('line');
          strk.setAttribute("x1", op.x);
          strk.setAttribute("y1", op.y);
          strk.setAttribute("x2", op.x);
          strk.setAttribute("y2", op.args[0]);
          strk.style.stroke = "black";
          strk.style.strokeWidth = "1";
          page.appendChild(strk);
          break;
        case 'Vlinew':
          strk = createSvgElement('rect');
          strk.setAttribute("x", op.x);
          strk.setAttribute("y", op.y);
          strk.setAttribute("width", op.args[1]);
          strk.setAttribute("height", op.args[0] - op.y);
          strk.style.fill = "black";
          page.appendChild(strk);
          break;
        case 'vline':
          strk = createSvgElement('line');
          strk.setAttribute("x1", op.x);
          strk.setAttribute("y1", op.y);
          strk.setAttribute("x2", op.x);
          strk.setAttribute("y2", op.y + op.args[0]);
          strk.style.stroke = "black";
          strk.style.strokeWidth = "1";
          page.appendChild(strk);
          break;
        case 'curve':
          curve(page, op);
          break;
        case 'lineV':
          strk = createSvgElement('path');
          strk.setAttribute("d", "M " + op.x + "," + op.y + " L" + op.args[
              0] + "," + op.args[1] + " " + (op.args[0] + op.args[2]) +
            "," + op.args[1] + " " + (op.x + op.args[2]) + "," + op.y +
            "z");
          strk.style.fill = "currentColor";
          strk.style.stroke = "currentColor";
          page.appendChild(strk);
          break;
        case 'rect':
          strk = createSvgElement('rect');
          strk.setAttribute("x", op.x);
          strk.setAttribute("y", op.y);
          strk.setAttribute("width", op.args[0]);
          strk.setAttribute("height", op.args[1]);
          strk.style.fill = "black";
          page.appendChild(strk);
          break;
        case 'dot':
          strk = createSvgElement('circle');
          strk.setAttribute("cx", op.x);
          strk.setAttribute("cy", op.y);
          strk.setAttribute("r", op.args[0]);
          strk.style.fill = "black";
          page.appendChild(strk);
          break;
        case 'draw':
          draw(page, op);
          break;
        case 'text':
          strk = createSvgElement('text');
          strk.setAttribute("x", op.x);
          strk.setAttribute("y", op.y - 6);
          strk.setAttribute("text-anchor", "middle");
          strk.setAttribute("alignment-baseline", "baseline");
          strk.style.fontSize = 12;
          strk.style.fontFamily = g_option.fontFamily;
          strk.style.fill = "black";
          strk.textContent = op.args[2];

          page.appendChild(strk);
          break;
        case 'char':
          break;
      }
    }

    if (this.cursor) {
      let bpo = this.beatPositions[this.cursor - 1];
      let y0 = this.rowBaselineY[bpo.rowIndex - 1];
      let y1 = this.rowBaselineY[bpo.rowIndex];
      let h = y1 - y0;

      let cursor = createSvgElement('g');

      cursor.id = "cursor";
      cursor.setAttribute("transform", "translate(" + bpo.x + "," + y0 + ")");
      page.appendChild(cursor);

      let path = createSvgElement('path');
      path.setAttribute("d", "M 0,0 v" + h + "m-5,0h10m0,-" + h + "h-10");
      path.style.stroke = "red";
      cursor.appendChild(path);
    }
  }

  /********************************
   *
   *  Drawer in SVG
   *
   *******************************/
  function drawIcon(ctx, img, x: number, y: number, w?: number, h?: number) {
    let use = createSvgElement('use');
    if (w) { w /= img.w; } else { w = 1; }
    if (h) { h /= img.h; } else { h = 1; }
    w = Math.max(w, h);
    use.setAttribute("transform", "scale(" + w + "," + w + ")");
    use.setAttribute("x", (x - (img.ax || 0)) / w);
    use.setAttribute("y", (y - (img.ay || 0)) / w);
    use.setAttribute("href", "#" + img.id);

    ctx.appendChild(use);
  }

  function draw(ctx, op: GStroke) {
    var use, img = gEID[op.args[2]];
    if (img) {
      drawIcon(ctx, img, op.x, op.y, ...op.args);
      return;
    }

    var arr = op.args[2].split('-');
    if (arr.length >= 1) img = arr[0];
    switch (img) {
      case 'triangle':
        use = createSvgElement('path');
        use.setAttribute("d", "m 0,0 l -2,-8 4,0 z");
        use.style.fill = "currentColor";
        use.setAttribute("transform", "translate(" + op.x + "," + op.y + ")");
        ctx.appendChild(use);
        break;
      case 'tsuyoi':
        use = createSvgElement('path');
        use.setAttribute("d", "m 4,-4 l -8,4 8,4");
        use.style.stroke = "currentColor";
        use.style.fill = "none";
        use.setAttribute("transform", "translate(" + op.x + "," + op.y + ")");
        ctx.appendChild(use);
        break;
      case 'yowai':
        use = createSvgElement('path');
        use.setAttribute("d", "m -4,-4 l 8,4 -8,4");
        use.style.stroke = "currentColor";
        use.style.fill = "none";
        use.setAttribute("transform", "translate(" + op.x + "," + op.y + ")");
        ctx.appendChild(use);
        break;
      case 'flagd':
        for (let y = op.y, img = gEID["noteflag-d"], nth = parseInt(arr[
            1]); nth > 4; nth >>= 1, y -= 3.5) {
          drawIcon(ctx, img, op.x, y, op.args[0], op.args[1]);
        }
        break;
      case 'flagu':
        for (let y = op.y, img = gEID["noteflag"], nth = parseInt(arr[
            1]); nth > 4; nth >>= 1, y += 3.5) {
          drawIcon(ctx, img, op.x, y, op.args[0], op.args[1]);
        }
        break;
      case 'bracket':
        break;
    }
  }

}
