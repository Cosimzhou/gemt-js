/*************************************************************************
 *  EMT-score.js
 *
 *
 *  > File Name: gemt-implement-svg.js
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

  var gEID = {
    "g-clef": { id: "clef_g", ay: 32, w: 20, h: 52 },
    "f-clef": { id: "clef_f", ay: 7, w: 21.6, h: 24 },
    "c-clef": { id: "clef_c", ay: 15.25, w: 21.7, h: 31.5 },

    "sharp": { id: "sharp", ay: 8, w: 5.48, h: 14.93 },
    "flat": { id: "flat", ay: 8, w: 5.03, h: 12.98 },
    "natural": { id: "natural", ay: 8, w: 4, h: 15.2 },

    "rest-4": { id: "rest_4th", ay: 13, w: 8, h: 24 },
    "rest-8": { id: "rest_8th", ay: 8, w: 10, h: 18 },
    "rest-16": { id: "rest_16th", ay: 8, w: 10, h: 18 },
    "rest-32": { id: "rest_32th", ay: 8, w: 10, h: 18 },

    "note": { id: "note_4th", ay: 3.78, w: 9.02, h: 7.56 },
    "note2": { id: "note_2th", ay: 3.78, w: 9.02, h: 7.56 },
    "fullnote": { id: "note_full", ax: 0.8, ay: 4, w: 12.6, h: 8.1 },

    "notetail-d": {
      id: "note_tail-down",
      ax: 0.8,
      ay: 15,
      w: 12.6,
      h: 8.1
    },
    "notetail": { id: "note_tail-up", ax: 0.8, ay: 0.5, w: 12.6, h: 8.1 },

    "fermata": { id: "fermata", ax: 0.8, ay: 5, w: 17, h: 12 },

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
  };

  //<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="10" height="8.77" viewBox="0 0 1.6 1.408">
  //  <path transform="matrix(0.0044,0,0,-0.0044,0,0.796399923)"

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
    //use.transform = "translate(" + op.x + "," + op.y + ")";
    ctx.appendChild(use);
  }

  //function curveChar(ctx, op, ch) {
  //  var args = op.curveArgs();

  //  ctx.beginPath();
  //  //ctx.rect();
  //  ctx.clip();

  //  ctx.moveTo(op.x, op.y);
  //  ctx.bezierCurveTo(...args[0]);
  //  ctx.bezierCurveTo(...args[1]);
  //  ctx.fill();
  //  ctx.closePath();
  //}

  exports['GContext'].prototype.debug = function() {}

  exports['GContext'].prototype.clearImpl = function(p) {
    var ctx = this.context();
    if (ctx && ctx.childElementCount) {
      ctx.removeChild(ctx.children[1]);
    }
  }

  exports['GContext'].prototype.printImpl = function(p) {
    var ctx = this.context();
    var range = this.getPageOpsSlice(p);
    var page = createSvgElement('g');

    page.id = "page-" + p;
    page.setAttribute("transform", "translate(0," + (-range[1]) + ")");
    ctx.appendChild(page);

    for (var op, strk, i = range[0][0], ops = this.strokes(); i < range[0][
        1]; ++i) {
      op = ops[i].symbol();
      switch (op.kind) {
        case 'line':
          strk = createSvgElement('line');
          strk.x1.baseVal.valueAsString = op.x;
          strk.y1.baseVal.valueAsString = op.y;
          strk.x2.baseVal.valueAsString = op.args[0];
          strk.y2.baseVal.valueAsString = op.args[1];
          page.appendChild(strk);
          break;
        case 'hline':
          strk = createSvgElement('line');
          strk.x1.baseVal.valueAsString = op.x;
          strk.y1.baseVal.valueAsString = op.y;
          strk.x2.baseVal.valueAsString = op.x + op.args[0];
          strk.y2.baseVal.valueAsString = op.y;
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
          strk.x1.baseVal.valueAsString = op.x;
          strk.y1.baseVal.valueAsString = op.y;
          strk.x2.baseVal.valueAsString = op.x;
          strk.y2.baseVal.valueAsString = op.args[0];
          strk.style.stroke = "black";
          strk.style.strokeWidth = "1";
          page.appendChild(strk);
          break;
        case 'Vlinew':
          strk = createSvgElement('rect');
          strk.x.baseVal.valueAsString = op.x;
          strk.y.baseVal.valueAsString = op.y;
          strk.width.baseVal.valueAsString = op.args[1];
          strk.height.baseVal.valueAsString = op.y + op.args[0];
          strk.style.fill = "black";
          page.appendChild(strk);
          break;
        case 'vline':
          strk = createSvgElement('line');
          strk.x1.baseVal.valueAsString = op.x;
          strk.y1.baseVal.valueAsString = op.y;
          strk.x2.baseVal.valueAsString = op.x;
          strk.y2.baseVal.valueAsString = op.y + op.args[0];
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
          strk.x.baseVal.valueAsString = op.x;
          strk.y.baseVal.valueAsString = op.y;
          strk.width.baseVal.valueAsString = op.args[0];
          strk.height.baseVal.valueAsString = op.args[1];
          strk.style.fill = "black";
          page.appendChild(strk);

          break;
        case 'dot':
          strk = createSvgElement('circle');
          strk.cx.baseVal.valueAsString = op.x;
          strk.cy.baseVal.valueAsString = op.y;
          strk.r.baseVal.valueAsString = op.args[0];
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
          strk.style.textAlign = 'center';
          //ctx.textBaseline = 'bottom';
          strk.style.fontSize = 12;
          strk.style.fontFamily = "微软雅黑";
          //strk.style.fontFamily = "Times New Roman";
          strk.style.fill = "black";
          strk.textContent = op.args[2];

          page.appendChild(strk);
          break;
        case 'char':
          break;
      }
    }

    if (this.cursor) {
      var bpo = this.beatPositions[this.cursor - 1];
      var y0 = this.rowBaselineY[bpo[1] - 1];
      var y1 = this.rowBaselineY[bpo[1]];
      var h = y1 - y0;

      var cursor = createSvgElement('g');

      cursor.id = "cursor";
      cursor.setAttribute("transform", "translate(" + bpo[0] + "," + y0 +
        ")");
      page.appendChild(cursor);


      var path = createSvgElement('path');
      path.setAttribute("d", "M 0,0 v" + h + " m -5,0 h10 m 0,-" + h +
        " h-10");
      path.style.stroke = "red";
      cursor.appendChild(path);

    }
  }

  /********************************
   *
   *  Drawer in SVG
   *
   *******************************/
  function drawIcon(ctx, img, x, y, w, h) {
    var use = createSvgElement('use');
    if (w) {
      w /= img.w;
    } else { w = 1; }
    if (h) { h /= img.h; } else { h = 1; }
    w = Math.max(w, h);
    use.setAttribute("transform", "scale(" + w + "," + w + ")");

    use.x.baseVal.valueAsString = (x - (img.ax || 0)) / w;
    use.y.baseVal.valueAsString = (y - (img.ay || 0)) / w;
    use.href.baseVal = "#" + img.id;

    ctx.appendChild(use);
  }

  function draw(ctx, op) {
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
        use.setAttribute("d", "m 0,0 l 2,8 4,0 z");
        use.style.fill = "currentColor";
        use.transform = "translate(" + op.x + "," + op.y + ")";

        ctx.appendChild(use);

        break;
      case 'tsuyoi':
        use = createSvgElement('path');
        use.setAttribute("d", "m 0,0 l 8,4 0,8");
        use.style.stroke = "currentColor";
        use.transform = "translate(" + op.x + "," + op.y + ")";

        ctx.appendChild(use);

        //ctx.beginPath();
        //ctx.moveTo(op.x, op.y);
        //ctx.lineTo(op.x + 8, op.y + 4);
        //ctx.lineTo(op.x, op.y + 8);
        //ctx.stroke();
        //ctx.beginPath();
        break;
      case 'yowai':
        use = createSvgElement('path');
        use.setAttribute("d", "h8 l -8,4 8,8");
        use.style.stroke = "currentColor";
        use.setAttribute("transform", "translate(" + op.x + "," + op.y + ")");
        ctx.appendChild(use);

        //ctx.beginPath();
        //ctx.moveTo(op.x + 8, op.y);
        //ctx.lineTo(op.x, op.y + 4);
        //ctx.lineTo(op.x + 8, op.y + 8);
        //ctx.stroke();
        //ctx.beginPath();
        break;
      case 'taild':
        for (var y = op.y, img = gEID["notetail-d"], nth = parseInt(arr[
            1]); nth > 4; nth >>= 1, y -= 3.5) {
          drawIcon(ctx, img, op.x, y);
        }
        break;
      case 'tailu':
        for (var y = op.y, img = gEID["notetail"], nth = parseInt(arr[
            1]); nth > 4; nth >>= 1, y += 3.5) {
          drawIcon(ctx, img, op.x, y);
        }
        break;
      case 'bracket':
        break;
    }
  }

})();
