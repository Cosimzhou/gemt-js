/*************************************************************************
 *  EMT-score.js
 *
 *
 *  > File Name: gemt-implement.js
 *  > Author: cosim
 *  > Mail: cosimzhou@hotmail.com
 ************************************************************************/

(function() {
  var exports = window || {};

  /**
   * //////////////////////////////////////////////////////////////////////////////
   *
   *  E-Layer
   *
   * //////////////////////////////////////////////////////////////////////////////
   */

  var imageRootPath = "../svg/";

  function DImage(url, opts = {}) {
    this.done = false;
    this.tasks = [];
    this.img = new Image();
    this.img.crossOrigin = "anonymous";
    this.ax = opts.ax || 0;
    this.ay = opts.ay || 0;
    this.sx = opts.sx || 1;
    this.sy = opts.sy || 1;
    this.width = opts.w;
    this.height = opts.h;
    this.done_callback = opts.done_callback;

    var me = this;
    this.img.onload = function() {
      me.done = true;
      me.width = me.sx * me.img.width;
      me.height = me.sx * me.img.height;
      for (var e, i = 0; e = me.tasks[i]; ++i) {
        me.draw(...e);
      }
      me.tasks = null;
      if (me.done_callback) {
        me.done_callback();
      }
    };
    this.load(url);
  }
  exports.DImage = DImage;

  DImage.prototype.load = function(url) {
    if (url && this.img.src == "") {
      if (exports['SvgPack'] == null) {
        this.img.src = imageRootPath + url;
      } else {
        this.img.src = exports['SvgPack'][url];
      }
    }
  }

  DImage.prototype.draw = function(ctx, x, y, w = null, h = null) {
    if (this.done) {
      var cw = w || this.width,
        ch = h || this.height;
      ctx.drawImage(this.img, x - this.ax, y - this.ay, cw, ch);
    } else {
      this.tasks.push([...arguments]);
    }
  }

  function DImageDict() {
    this.dict = {
      "g-clef": new DImage("clef_g.svg", { ay: 32, w: 20, h: 52 }),
      "f-clef": new DImage("clef_f.svg", { ay: 7, w: 21.6, h: 24 }),
      "c-clef": new DImage("clef_c.svg", { ay: 15.25, w: 21.7, h: 31.5 }),

      "sharp": new DImage("sharp.svg", { ay: 8, w: 5.48, h: 14.93 }),
      "flat": new DImage("flat.svg", { ay: 8, w: 5.03, h: 12.98 }),
      "natural": new DImage("natural.svg", {
        ay: 8,
        w: 4,
        h: 15.2
      }), // sx: 0.8, sy: 0.8,

      "rest-4": new DImage("rest_4th.svg", { ay: 13, w: 8, h: 24 }),
      "rest-8": new DImage("rest_8th.svg", { ay: 8, w: 10, h: 18 }),
      "rest-16": new DImage("rest_16th.svg", { ay: 8, w: 10, h: 18 }),
      "rest-32": new DImage("rest_32th.svg", { ay: 8, w: 10, h: 18 }),

      "note": new DImage("note_4th.svg", { ay: 3.78, w: 9.02, h: 7.56 }),
      "note2": new DImage("note_2th.svg", { ay: 3.78, w: 9.02, h: 7.56 }),
      "fullnote": new DImage("note_full.svg", {
        ax: 0.8,
        ay: 4,
        w: 12.6,
        h: 8.1
      }),

      "notetail-d": new DImage("note_tail-down.svg", {
        ax: 0.8,
        ay: 15,
        w: 12.6,
        h: 8.1
      }),
      "notetail": new DImage("note_tail-up.svg", {
        ax: 0.8,
        ay: 0.5,
        w: 12.6,
        h: 8.1
      }),

      "fermata": new DImage("fermata.svg", {
        ax: 0.8,
        ay: 5,
        w: 17,
        h: 12
      }),

      "num-0": new DImage("num-0.svg", { w: 12.5, h: 17.5 }),
      "num-1": new DImage("num-1.svg", { w: 12.5, h: 17.5 }),
      "num-2": new DImage("num-2.svg", { w: 12.5, h: 17.5 }),
      "num-3": new DImage("num-3.svg", { w: 12.5, h: 17.5 }),
      "num-4": new DImage("num-4.svg", { w: 12.5, h: 17.5 }),
      "num-5": new DImage("num-5.svg", { w: 12.5, h: 17.5 }),
      "num-6": new DImage("num-6.svg", { w: 12.5, h: 17.5 }),
      "num-7": new DImage("num-7.svg", { w: 12.5, h: 17.5 }),
      "num-8": new DImage("num-8.svg", { w: 12.5, h: 17.5 }),
      "num-9": new DImage("num-9.svg", { w: 12.5, h: 17.5 }),

      "brace": new DImage("brace.svg", { w: 8, h: 82 }),
      "mordant": new DImage("mordant.svg", { w: 13, h: 6 }),
      "mordant_lower": new DImage("mordant_lower.svg", { w: 13, h: 6 }),
      "mordant_long": new DImage("mordant_long.svg", { w: 18, h: 6 }),
    }
  }

  //<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="10" height="8.77" viewBox="0 0 1.6 1.408">
  //  <path transform="matrix(0.0044,0,0,-0.0044,0,0.796399923)"

  DImageDict.prototype.get = function(key) {
    return this.dict[key];
  }
  var gEID = new DImageDict();



  function curve(ctx, op) {
    var args = op.curveArgs();

    ctx.moveTo(op.x, op.y);
    ctx.bezierCurveTo(...args[0]);
    ctx.bezierCurveTo(...args[1]);
    ctx.fill();
  }

  function curveChar(ctx, op, ch) {
    var args = op.curveArgs();

    ctx.beginPath();
    //ctx.rect();
    ctx.clip();

    ctx.moveTo(op.x, op.y);
    ctx.bezierCurveTo(...args[0]);
    ctx.bezierCurveTo(...args[1]);
    ctx.fill();
    ctx.closePath();
  }

  exports['GContext'].prototype.debug = function() {
    return;
    var ctx = this.context2D;
    ctx.strokeStyle = "#ff0000";
    for (var i = 0; i < this._grid.array.length; ++i) {
      var rect = this._grid.array[i];
      ctx.rect(rect.left, rect.top, rect.right - rect.left, rect.bottom -
        rect.top);
    }
    ctx.stroke();
    ctx.closePath();


    return;
    for (var i = 0, bpo; bpo = this.beatPositions[i]; ++i) {
      ctx.moveTo(bpo[0], this.rowBaselineY[bpo[1] - 1]);
      ctx.lineTo(bpo[0], this.rowBaselineY[bpo[1]]);
    }
    ctx.stroke();
    ctx.closePath();
  }


  exports['GContext'].prototype.printImpl = function(p) {
    var ctx = this.context();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.beginPath();
    var range = this.getPageOpsSlice(p);
    ctx.translate(0, -range[1]);
    for (var op, i = range[0][0], ops = this.strokes(); i < range[0][1]; ++
      i) {
      op = ops[i].symbol();
      switch (op.kind) {
        case 'line':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.args[0], op.args[1]);
          ctx.stroke();
          break;
        case 'Vline':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.x, op.args[0]);
          ctx.stroke();
          break;
        case 'Vlinew':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.x, op.args[0]);
          ctx.lineTo(op.x + op.args[1], op.args[0]);
          ctx.lineTo(op.x + op.args[1], op.y);
          ctx.closePath();
          ctx.fill();
          break;
        case 'vline':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.x, op.y + op.args[0]);
          ctx.stroke();
          break;
        case 'hline':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.x + op.args[0], op.y);
          ctx.stroke();
          break;
        case 'curve':
          curve(ctx, op);
          break;
        case 'lineH':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.args[0], op.args[1]);
          ctx.lineTo(op.args[0], op.args[1] + op.args[2]);
          ctx.lineTo(op.x, op.y + op.args[2]);
          ctx.closePath();
          ctx.fill();
          break;
        case 'lineV':
          ctx.moveTo(op.x, op.y);
          ctx.lineTo(op.args[0], op.args[1]);
          ctx.lineTo(op.args[0] + op.args[2], op.args[1]);
          ctx.lineTo(op.x + op.args[2], op.y);
          ctx.closePath();
          ctx.fill();
          break;
        case 'rect':
          ctx.rect(op.x, op.y, op.args[0], op.args[1]);
          ctx.fill();
          break;
        case 'dot':
          ctx.beginPath();
          ctx.arc(op.x, op.y, op.args[0], 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fill();
          break;
        case 'draw':
          draw(ctx, op);
          break;
        case 'text':
          ctx.font = "12px 微软雅黑"
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          //ctx.fillStyle = 'red';
          //ctx.measureText("text length")
          ctx.fillText(op.args[2], op.x, op.y, 20);
          break;
        case 'char':
          break;
      }
    }

    if (this.cursor) {
      var bpo = this.beatPositions[this.cursor - 1];
      var y0 = this.rowBaselineY[bpo[1] - 1];
      var y1 = this.rowBaselineY[bpo[1]];
      ctx.beginPath();
      ctx.moveTo(bpo[0], y0);
      ctx.lineTo(bpo[0], y1);

      ctx.moveTo(bpo[0] - 5, y0);
      ctx.lineTo(bpo[0] + 5, y0);

      ctx.moveTo(bpo[0] - 5, y1);
      ctx.lineTo(bpo[0] + 5, y1);
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.closePath();
    }
  }

  /********************************
   *
   *  Drawer in canvas
   *
   *******************************/
  function draw(ctx, op) {
    var img = gEID.get(op.args[2]);
    if (img) {
      //if (op.args[2] != 'f-clef' && img) {
      //gEID.get(op.args[2])
      img.draw(ctx, op.x, op.y, op.args[0], op.args[1]);
      return;
    }

    var arr = op.args[2].split('-');
    if (arr.length >= 1) img = arr[0];
    switch (img) {
      case 'triangle':
        ctx.moveTo(op.x, op.y);
        ctx.lineTo(op.x + 2, op.y + 8);
        ctx.lineTo(op.x + 4, op.y);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tsuyoi':
        ctx.beginPath();
        ctx.moveTo(op.x, op.y);
        ctx.lineTo(op.x + 8, op.y + 4);
        ctx.lineTo(op.x, op.y + 8);
        ctx.stroke();
        ctx.beginPath();
        break;
      case 'yowai':
        ctx.beginPath();
        ctx.moveTo(op.x + 8, op.y);
        ctx.lineTo(op.x, op.y + 4);
        ctx.lineTo(op.x + 8, op.y + 8);
        ctx.stroke();
        ctx.beginPath();
        break;
      case 'dot':
        ctx.beginPath();
        ctx.moveTo(op.x + 8, op.y);
        ctx.lineTo(op.x, op.y + 4);
        ctx.lineTo(op.x + 8, op.y + 8);
        ctx.stroke();
        ctx.beginPath();
        break;
      case 'f':
        draw_f_clef(ctx, op.x, op.y);
        break;
      case 'taild':
        for (var y = op.y, nth = parseInt(arr[1]); nth > 4; nth >>= 1, y -=
          3.5) {
          gEID.get("notetail-d").draw(ctx, op.x, y);
        }
        ctx.fill();
        break;
      case 'tailu':
        for (var y = op.y, nth = parseInt(arr[1]); nth > 4; nth >>= 1, y +=
          3.5) {
          gEID.get("notetail").draw(ctx, op.x, y);
        }
        ctx.fill();
        break;
      case 'bracket':
        break;
    }
  }


  //var funcs = {
  //  "t": "transform",
  //  "c": "bezierCurveTo",
  //  "m": "moveTo",
  //  "l": "lineTo",
  //  "s": "save",
  //  "e": "restore",
  //  "r": "rect",
  //  "z": "closePath",
  //  "a": "ellipse",
  //};

  //function draw_basic_ops(ctx, ops) {
  //  for (var i = 0, op; op = ops[i]; i++) {
  //    ctx[funcs[op[0]]](...op[1]);
  //  }
  //}

  //function draw_arpeggio(ctx, id, x, y, w, h) {

  //}

  //function draw_f_clef(ctx, x, y) {
  //  ctx.save();
  //  ctx.translate(x, y);
  //  draw_basic_ops(ctx, [
  //    ['s', []],
  //    ['t', [1.2, 0, 0, 1.2, -277.1376086687087, -647.3879648998554]],
  //    ['m', [248.25999, 536.802]],
  //    ['b', [248.26766, 537.17138, 248.11044, 537.54065, 247.82878,
  //      537.78185
  //    ]],
  //    ['b', [247.46853, 538.11076, 246.91933, 538.17813, 246.47048,
  //      538.01071
  //    ]],
  //    ['b', [246.02563, 537.83894, 245.69678, 537.39883, 245.67145,
  //      536.9206
  //    ]],
  //    ['b', [245.63767, 536.54689, 245.75685, 536.15479, 246.02747,
  //      535.88867
  //    ]],
  //    ['b', [246.28257, 535.6168, 246.66244, 535.48397, 247.03147,
  //      535.50645
  //    ]],
  //    ['b', [247.41131, 535.51452, 247.77805, 535.70601, 248.00489,
  //      536.01019
  //    ]],
  //    ['b', [248.17962, 536.23452, 248.26238, 536.51954, 248.25999,
  //      536.802
  //    ]],
  //    ['c', []],
  //    ['m', [248.25999, 542.64502]],
  //    ['b', [248.26772, 543.01469, 248.11076, 543.38446, 247.82878,
  //      543.62585
  //    ]],
  //    ['b', [247.46853, 543.95476, 246.91933, 544.02213, 246.47048,
  //      543.85472
  //    ]],
  //    ['b', [246.02537, 543.68288, 245.69655, 543.24237, 245.67145,
  //      542.76389
  //    ]],
  //    ['b', [245.63651, 542.3899, 245.76354, 542.00308, 246.027,
  //      541.733
  //    ]],
  //    ['b', [246.27663, 541.45454, 246.6606, 541.3279, 247.02845,
  //      541.3495
  //    ]],
  //    ['b', [247.5123, 541.36282, 247.95159, 541.69251, 248.15162,
  //      542.12465
  //    ]],
  //    ['b', [248.22565, 542.2874, 248.26043, 542.46657, 248.25999,
  //      542.64502
  //    ]],
  //    ['c', []],
  //    ['m', [243.979, 540.86798]],
  //    ['b', [244.02398, 543.69258, 242.7636, 546.43815, 240.76469,
  //      548.40449
  //    ]],
  //    ['b', [238.27527, 550.89277, 235.01791, 552.47534, 231.69762,
  //      553.53261
  //    ]],
  //    ['b', [231.2559, 553.77182, 230.5897, 553.45643, 231.2855,
  //      553.13144
  //    ]],
  //    ['b', [232.62346, 552.52289, 234.01319, 552.0005, 235.24564,
  //      551.1808
  //    ]],
  //    ['b', [237.96799, 549.4975, 240.26523, 546.84674, 240.82279,
  //      543.61854
  //    ]],
  //    ['b', [241.14771, 541.65352, 241.05724, 539.60795, 240.56484,
  //      537.67852
  //    ]],
  //    ['b', [240.20352, 536.25993, 239.22033, 534.7955, 237.66352,
  //      534.58587
  //    ]],
  //    ['b', [236.25068, 534.36961, 234.74885, 534.85905, 233.74057,
  //      535.88093
  //    ]],
  //    ['b', [233.47541, 536.14967, 232.95916, 536.89403, 233.04435,
  //      537.74747
  //    ]],
  //    ['b', [233.64637, 537.27468, 233.60528, 537.32732, 234.099,
  //      537.10717
  //    ]],
  //    ['b', [235.23573, 536.60031, 236.74349, 537.32105, 237.027,
  //      538.57272
  //    ]],
  //    ['b', [237.32909, 539.72295, 237.09551, 541.18638, 235.96036,
  //      541.7996
  //    ]],
  //    ['b', [234.77512, 542.44413, 233.02612, 542.17738, 232.3645,
  //      540.90866
  //    ]],
  //    ['b', [231.26916, 538.95418, 231.87147, 536.28193, 233.64202,
  //      534.92571
  //    ]],
  //    ['b', [235.44514, 533.42924, 238.07609, 533.37089, 240.19963,
  //      534.13862
  //    ]],
  //    ['b', [242.38419, 534.95111, 243.68629, 537.21483, 243.89691,
  //      539.45694
  //    ]],
  //    ['b', [243.95419, 539.92492, 243.97896, 540.39668, 243.979,
  //      540.86798
  //    ]],
  //    ['c', []],
  //    ['e', []],
  //  ]);

  //  ctx.fill();
  //  ctx.restore();

  //}


})();
