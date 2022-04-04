/* 获取 文件的路径 ，用于测试*/
function getFilePath(node) {
  var arr = node.value.split("\\");
  load(arr[arr.length - 1]);
}

function p2ptransform(pt, tf) {
  return [
    pt[0] * tf[0] + pt[1] * tf[2] + tf[4],
    pt[0] * tf[1] + pt[1] * tf[3] + tf[5]
  ];
}

function v2vrevtransform(pt, tf) {
  var tf1 = tf.concat();
  tf1[4] = tf1[5] = 0;
  return p2prevtransform(pt, tf1);
}

function p2prevtransform(pt, tf) {
  var a = tf[0],
    b = tf[1],
    c = tf[2],
    d = tf[3],
    e = tf[4],
    f = tf[5];

  if (a && b) {
    var r1 = (pt[0] - e) / a;
    var tmp1 = r1 - (pt[1] - f) / b;
    var k = c / a - d / b;
    if (k == 0) {
      console.error("bad transform");
      return [NaN, NaN];
    }

    var y = tmp1 / k;
    var x = r1 - (c / a) * y;
    return [x, y];
  }

  if (a) {
    if (d == 0) {
      console.error("bad transform");
      return [NaN, NaN];
    }
    var y = (pt[1] - f) / d;
    var x = (pt[0] - e - c * y) / a
    return [x, y];
  }

  if (b) {
    if (c == 0) {
      console.error("bad transform");
      return [NaN, NaN];
    }

    var y = (pt[1] - e) / c;
    var x = (pt[0] - f - d * y) / b
    return [x, y];
  }

  console.error("bad transform");
  return [NaN, NaN];
}

var operations = [];
var ctrlPoints = [];

var CanvasSize = 1000;
var Container = document.getElementById("myCanvas");
var Height = Container.height,
  Width = Container.width;
var ctx = Container.getContext("2d");
var Scale = 10;
var Ratio = 2;
var Radius = 4 * Ratio / Scale;
var selPointIdx = NaN;
var DragX = 0;
var DragY = 0;
var Dragging = false;
var funcs = {
  "f": "transform",
  "v": "save",
  "e": "restore",
  "c": "bezierCurveTo",
  "s": "bezierCurveTo",
  "t": "quadraticCurveTo",
  "q": "quadraticCurveTo",
  "m": "moveTo",
  "l": "lineTo",
  "r": "rect",
  "z": "closePath",
  "a": "ellipse",
  "d": "drawImage",
};

function CtrlPoint() {
  this.x = this.y = 0;
  this.opi = 0;
  this.offseti = 0;
  this.transforms = [];
}

CtrlPoint.prototype.draw = function(ctx) {
  ctx.save();
  var radius = Radius;
  for (var tf of this.transforms) {
    ctx.transform(...tf);
    radius /= tf[0];
  }
  ctx.moveTo(this.x + radius, this.y);
  ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
  ctx.restore();
}

CtrlPoint.prototype.move = function(dx, dy) {
  var pt = [dx, dy];
  for (var ti = this.transforms.length - 1; ti >= 0; ti--)
    pt = v2vrevtransform(pt, this.transforms[ti]);
  this.x += pt[0];
  this.y += pt[1];

  operations[this.opi][1][this.offseti] = this.x;
  operations[this.opi][1][this.offseti + 1] = this.y;
}

CtrlPoint.prototype.isPointIn = function(pt) {
  var radius = Radius;
  for (var ti = this.transforms.length - 1; ti >= 0; ti--) {
    pt = p2prevtransform(pt, this.transforms[ti]);
    radius /= this.transforms[ti][0]
  }

  return Math.hypot(this.x - pt[0], this.y - pt[1]) <= Math.abs(radius);
}

function BuildCtrlPoints() {
  var tfs = [];
  ctrlPoints = [];
  for (var i = 0, op; op = operations[i]; ++i) {
    if (op[0] == 'f') {
      tfs.push(op[1]);
      continue;
    } else if (op[0] == 'e') {
      tfs.pop();
      continue;
    }

    for (var j = 0, ops = op[1]; j < ops.length; j += 2) {
      var cpt = new CtrlPoint();
      cpt.transforms = tfs.concat();
      cpt.x = ops[j];
      cpt.y = ops[j + 1];
      cpt.opi = i;
      cpt.offseti = j;

      ctrlPoints.push(cpt);
    }
  }
}


// Update the current slider value (each time you drag the slider handle)
document.getElementById("myRange").oninput = function() {
  setScale(this.value);
}
document.getElementById("fill_check").oninput = updateScreen;
document.getElementById("show_points").oninput = updateScreen;
document.getElementById("vertical_plus").oninput = updateScreen;

Container.addEventListener("mousedown", function(e) {
  var lp = Scr2Lgc(e.offsetX, e.offsetY);
  for (var i = 0, pt; pt = ctrlPoints[i]; ++i) {
    if (pt.isPointIn(lp)) {
      selPointIdx = i;
      return;
    }
  }

  Dragging = true;
});
Container.addEventListener("mousemove", function(e) {
  if (Dragging) {
    DragX += e.movementX * Ratio;
    DragY += e.movementY * Ratio;

    updateScreen();
  }

  var opInfo = "";
  if (!isNaN(selPointIdx)) {
    var cpt = ctrlPoints[selPointIdx];
    cpt.move(e.movementX * Ratio / Scale, e.movementY * Ratio / Scale);
    opInfo += " Ops: <" + cpt.opi + "," + cpt.offseti + ">";

    updateScreen();
    textOps();
  }

  document.getElementById("pos_info").innerHTML = "Pos:" + JSON.stringify(
      Scr2Lgc(e.offsetX, e.offsetY)) + " @Screen:" + e.offsetX + "," + e
    .offsetY + opInfo;
});
Container.addEventListener("mouseup", function(e) {
  Dragging = false;
  selPointIdx = NaN;
});
Container.addEventListener("mouseleave", function(e) {
  Dragging = false;
  selPointIdx = NaN;
});

function Scr2Lgc(x, y) {
  x *= 2, y *= 2;
  x -= Width / 2 + DragX;
  y -= Height / 2 + DragY;

  return [x / Scale, y / Scale];
}

function rebuild() {
  var arr, text = document.getElementById("opstext").value;
  try {
    arr = eval(text);
  } catch (e) {
    var svg =
      '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
      '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.0" width="21.6" height="24.0">' +
      '<path d="' + text + '" style="fill:#000000;fill-opacity:1.0"/></svg>';
    var data = "data:image/svg+xml;base64," + btoa(svg);
    var img = new Image();
    img.onload = function() {
      operations = [
        ['d', [img, 0, 0]]
      ];
      updateScreen();
    }
    console.log(svg);
    img.src = data;
    return;
  }
  operations = arr;
  BuildCtrlPoints();

  console.log(makePath());

  updateScreen();
}

function zoom(pt, scale) {
  var x = pt[0],
    y = pt[1];
  var hw = Width / 2,
    hh = Height / 2;
  var ratio = scale / Scale - 1;

  this._zoom = nzoom;

  DragX += (hw + DragX - x) * ratio;
  DragY += (hh + DragY - y) * ratio;
}

function setScale(s) {
  var nScale = parseFloat(s) / 10;
  if (nScale > 20) {
    nScale = 20 * Math.exp((nScale - 20) / 20);
  }

  Radius = 4 * Ratio / nScale;

  document.getElementById("rate").value = nScale;

  Scale = nScale;
  updateScreen();
}

function updateScreen() {
  Container.width = Container.width;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var cx = Width / 2 + DragX,
    cy = Height / 2 + DragY;
  ctx.moveTo(0, cy), ctx.lineTo(Width, cy);
  ctx.moveTo(cx, 0), ctx.lineTo(cx, Height);
  ctx.strokeStyle = 'red';
  ctx.stroke();

  var yscale = Scale;
  if (document.getElementById("vertical_plus").checked) {
    yscale = -Scale;
  }
  ctx.strokeStyle = 'black';
  ctx.translate(cx, cy);
  ctx.scale(Scale, yscale);
  ctx.lineWidth = 1 / Scale;

  drawOps(ctx, operations);
}

function svgTreat(g) {
  function TransformedElement(g, func) {
    var trans = g.transform && g.transform.baseVal.length && g.transform
      .baseVal[0];

    if (trans) {
      var mat = trans.matrix;
      operations.push(['v', []]);
      operations.push(['f', [mat.a, mat.b, mat.c, mat.d, mat.e, mat.f]]);
    }

    func();

    if (trans) {
      operations.push(['e', []]);
    }
  }

  switch (g.tagName.toLowerCase()) {
    case 'svg':
      for (var tag of g.children) {
        svgTreat(tag);
      }
      break;
    case 'path':
      TransformedElement(g, function() {
        operations = operations.concat(parse(g.attributes["d"]
          .nodeValue));
      });
      break;
    case 'line':
      var x1 = g.attributes["x1"],
        y1 = g.attributes["y1"],
        x2 = g.attributes["x2"],
        y2 = g.attributes["y2"];

      operations.push(['m', [parseFloat(x1.value), parseFloat(y1.value)]]);
      operations.push(['l', [parseFloat(x2.value), parseFloat(y2.value)]]);
      break;
    case 'rect':
      TransformedElement(g, function() {
        var x = g.attributes["x"],
          y = g.attributes["y"],
          width = g.attributes["width"],
          height = g.attributes["height"];

        operations.push(['r', [parseFloat(x.value), parseFloat(y.value),
          parseFloat(width.value), parseFloat(height.value)
        ]]);
      });
      break;
    case 'g':
      for (var tag of g.children) {
        TransformedElement(g, function() {
          svgTreat(tag);
        });
      }
      break;
  }
}

function show_path() {
  var arr, text = document.getElementById("opstext").value;

  showPath(text);
}

function showPath(path_text) {
  var url = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(url, "svg");
  var path = document.createElementNS(url, "path");

  svg.appendChild(path);
  path.setAttribute("d", path_text);

  loadSVG(svg);
}

function load(file) {
  var fetch = new XMLHttpRequest();
  fetch.open('GET', "../svg/" + file);
  fetch.overrideMimeType('text/plain; charset=x-user-defined');
  fetch.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var parser = new DOMParser();
        var data = parser.parseFromString(this.responseText, "text/xml");
        loadSVG(data);
      } else {
        onerror && onerror('Unable to load MIDI file');
      }
    }
  };

  fetch.send();
}

function loadSVG(data) {
  var g = data.children[0];
  operations = [];
  ctrlPoints = [];
  svgTreat(g);
  BuildCtrlPoints();

  translate();
  updateScreen();
  console.log(operations);
  textOps();
}

function textOps() {
  var buf = "[";
  for (var op of operations) {
    buf += "['" + op[0] + "',[";
    for (var n in op[1]) {
      if (n > 0) buf += ",";
      buf += op[1][n];
    }
    buf += "]],\n"
  }
  buf += "]";
  document.getElementById("opstext").value = buf;
}

function parse(cmd) {
  // M = moveto           *
  // L = lineto           *
  // H = horizontal lineto
  // V = vertical lineto
  // C = curveto          *
  // S = smooth curveto
  // Q = quadratic Belzier curve
  // T = smooth quadratic Belzier curveto
  // A = elliptical Arc
  // Z = closepath        *
  console.log(cmd);
  var arr = [];
  for (var i = 0, ch, lastIsNum = false; i < cmd.length; i++) {
    ch = cmd.charAt(i);
    if (ch == 'e' || ch == 'E') {
      if (lastIsNum) {
        arr[arr.length - 1] += 'e';
      } else {
        console.error("ch == e");
      }
    } else if (('A' <= ch && ch <= 'Z') || ('a' <= ch && ch <= 'z')) {
      arr.push(ch);
      lastIsNum = false;
    } else if ('0' <= ch && ch <= '9') {
      if (lastIsNum) {
        arr[arr.length - 1] += ch;
      } else {
        arr.push(ch);
        lastIsNum = true;
      }
    } else if (ch == '-' || ch == '+') {
      var last = arr[arr.length - 1];
      if (lastIsNum && last.substr(last.length - 1) == 'e') {
        arr[arr.length - 1] += ch;
      } else {
        arr.push(ch);
        lastIsNum = true;
      }
    } else if (ch == '.') {
      if (lastIsNum) {
        arr[arr.length - 1] += '.';
      } else {
        arr.push('0.');
        lastIsNum = true;
      }
    } else {
      lastIsNum = false;
    }
  }

  console.log(arr);
  var result = [],
    op;
  var curpos = [0, 0],
    preCe, preE, pre, ppre;
  for (var i = 0, ce, e; e = arr[i]; i++) {
    ce = e.toUpperCase();
    if ('A' <= ce.charAt(0) && ce.charAt(0) <= 'Z') {
      preE = ce != e;
      i++;
    } else {
      if (preCe == 'M') preCe = 'L';
      ce = preCe;
    }
    switch (ce) {
      case 'A':
        op = ['a', arr.slice(i, i += 7).map(parseFloat)];
        break;
      case 'M':
        op = ['m', arr.slice(i, i += 2).map(parseFloat)];
        if (preE) {
          op[1][0] += curpos[0];
          op[1][1] += curpos[1];
        }
        break;
      case 'L':
        op = ['l', arr.slice(i, i += 2).map(parseFloat)];
        if (preE) {
          op[1][0] += curpos[0];
          op[1][1] += curpos[1];
        }
        break;
      case 'C':
        op = ['c', arr.slice(i, i += 6).map(parseFloat)];
        if (preE) {
          for (var point_i = 0; point_i < 3; point_i++) {
            op[1][point_i * 2] += curpos[0];
            op[1][point_i * 2 + 1] += curpos[1];
          }
        }
        break;
      case 'S':
        op = ['s', arr.slice(i, i += 4).map(parseFloat)];
        if (preE) {
          for (var point_i = 0; point_i < 2; point_i++) {
            op[1][point_i * 2] += curpos[0];
            op[1][point_i * 2 + 1] += curpos[1];
          }
        }
        pre = result[result.length - 1];
        if (funcs[pre[0]] == 'bezierCurveTo') {
          op[1] = pre[1].slice(4, 6).concat(op[1]);
          op[1][0] *= 2, op[1][1] *= 2;
          op[1][0] -= pre[1][2], op[1][1] -= pre[1][3];
        } else if (pre[0] == 'l') {
          ppre = result[result.length - 2];
          op[1] = pre[1].concat(op[1]);
          op[1][0] *= 2, op[1][1] *= 2;
          op[1][0] -= ppre[1][ppre[1].length - 2], op[1][1] -= ppre[1][ppre[1]
            .length - 1
          ];
        } else {
          console.error("s must follow c or s, but follows" + pre[0]);
        }
        break;
      case 'Q':
        op = ['q', arr.slice(i, i += 4).map(parseFloat)];
        //op[1] = op[1].slice(0, 2).concat(op[1]);
        if (preE) {
          for (var point_i = 0; point_i < 2; point_i++) {
            op[1][point_i * 2] += curpos[0];
            op[1][point_i * 2 + 1] += curpos[1];
          }
        }
        break;
      case 'T':
        op = ['t', arr.slice(i, i += 2).map(parseFloat)];
        if (preE) {
          op[1][0] += curpos[0];
          op[1][1] += curpos[1];
        }
        pre = result[result.length - 1];
        if (funcs[pre[0]] == 'quadraticCurveTo') {
          var tmpop = pre[1].slice(2, 4);
          tmpop[0] *= 2, tmpop[1] *= 2;
          tmpop[0] -= pre[1][0], tmpop[1] -= pre[1][1];
          op[1] = tmpop.concat(op[1]);
        } else if (pre[0] == 'l') {
          ppre = result[result.length - 2];
          op[1] = ppre[1].slice(ppre[1].length - 2).concat(pre[1].concat(op[
            1]));
          //op[1][0] *= 2, op[1][1] *= 2;
          //op[1][0] -= ppre[1][ppre[1].length - 2], op[1][1] -= ppre[1][ppre[1]
          //  .length - 1
          //];
        } else {
          console.error("s must follow c or s, but follows " + pre[0]);
        }
        break;
      case 'Z':
        op = ['z', []]
        break;
      case 'H':
        op = ['l', [parseFloat(arr[i++]), curpos[1]]];
        if (preE) {
          op[1][0] += curpos[0];
        }
        break;
      case 'V':
        op = ['l', [curpos[0], parseFloat(arr[i++])]];
        if (preE) {
          op[1][1] += curpos[1];
        }
        break;
      default:
        console.error("unknown type:", ce);
        break;
    }
    i--;
    if (op[1].length >= 2)
      curpos = op[1].slice(op[1].length - 2);

    result.push(op);
    preCe = ce;
  }

  return result;
}

function drawOps(ctx, ops) {
  ctx.beginPath();
  for (var i = 0, op; op = ops[i]; i++) {
    ctx[funcs[op[0]]](...op[1]);
  }

  if (document.getElementById("fill_check").checked) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
  ctx.closePath();

  if (document.getElementById("show_points").checked) {
    ctx.beginPath();
    for (var cpt of ctrlPoints)
      cpt.draw(ctx);
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();

    if (ops.length > 0) {
      ctx.beginPath();
      ctrlPoints[0].draw(ctx);
      ctx.closePath();
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }
}

function translate() {
  return;
  var oX = null,
    oY = null;
  for (var i = 0, op; op = operations[i]; i++) {
    if (oX == null && op[0] == 'm') {
      oX = op[1][0];
      oY = op[1][1];
    }
    if (oX == null) continue;
    if (op[0] == 'r') {
      op[1][0] -= oX;
      op[1][1] -= oY;
    }
    if (op[0] != 'f')
      for (var j = 0; j < op[1].length; j += 2) {
        op[1][j] -= oX;
        op[1][j + 1] -= oY;
      }
  }
}

function makePath() {
  var buf = '';

  for (var i = 0, op = operations[i], pos, curPos = [0, 0]; op = operations[
      i]; i++) {
    pos = op[1];
    switch (op[0]) {
      case 'm':
        buf += "M" + pos.join(",");
        curPos = pos.concat();
        break;
      case 'l':
        if (pos[0] == curPos[0]) {
          buf += "V" + pos[1];
        } else if (pos[1] == curPos[1]) {
          buf += "H" + pos[0];
        } else {
          buf += "L" + pos.join(",");
        }
        curPos = pos;
        break;
      case 'c':
        buf += "C" + pos.join(",");
        curPos = pos.slice(4, 2);
        break;
      case 'z':
        buf += 'z';
        break;
      case 'r':
        buf += "M" + pos.slice(0, 2).join(",") + "h" + pos[2] + "v" + pos[3] +
          "h-" + pos[2] + "z";
        break;
      default:
        break;
    }
  }

  return buf;
}

function transforming() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(0, -7);
  ctx.scale(1.2, 1.2);
  ctx.transform(1, 0, 0, 1, -230.94800510210916, -533.6566036478616);
  var tr = ctx.getTransform();
  var param = [tr.a, tr.b, tr.c, tr.d, tr.e, tr.f];
  console.log(param);
  ctx.restore();
}




document.addEventListener("keydown", function(e) {
  console.log(e);
  switch (e.code) {
    case "Delete":
      if (!isNaN(selPointIdx)) {
        var cpt = ctrlPoints[selPointIdx];
        operations.splice(cpt.opi, 1);
        selPointIdx = NaN;
        for (var i = 0, o = 0; i < ctrlPoints.length; i++) {
          if (ctrlPoints[i].opi == cpt.opi) {
            continue;
          } else if (ctrlPoints[i].opi > cpt.opi) {
            ctrlPoints[i].opi--;
          }
          ctrlPoints[o++] = ctrlPoints[i];
        }
        updateScreen();
      }
      break;
      //case "Enter":
      //  search();
      //  break;
      //case "KeyM":
      //  viewer.toggleEdit();
      //  break;
      //case "KeyR":
      //  viewer.toggleMeasure();
      //  break;
      //case "KeyA":
      //case "ArrowLeft":
      //  viewer.moveObject(-1, 0);
      //  viewer.refresh();
      //  break;
      //case "KeyD":
      //case "ArrowRight":
      //  viewer.moveObject(1, 0);
      //  viewer.refresh();
      //  break;
      //case "KeyW":
      //case "ArrowUp":
      //  viewer.moveObject(0, 1);
      //  viewer.refresh();
      //  break;
      //case "KeyS":
      //case "ArrowDown":
      //  viewer.moveObject(0, -1);
      //  viewer.refresh();
      //  break;
      //case "Tab":
      //  viewer.tabSelGeo();
      //  break;
      //case "KeyQ":
      //  console.log(viewer.dump());
      //  break;
    default:
      //e.preventDefault();
      break;
  }
});
