
/* 获取 文件的路径 ，用于测试*/
function getFilePath(node){
  var arr = node.value.split("\\");
  load(arr[arr.length-1]);
}

var operations = [];

var Container = document.getElementById("myCanvas");
var ctx = Container.getContext("2d");
var Scale = 10;
var funcs = {
  "f": "transform",
  "v": "save",
  "e": "restore",
  "c": "bezierCurveTo",
  "s": "bezierCurveTo",
  "t": "bezierCurveTo",
  "q": "bezierCurveTo",
  "m": "moveTo",
  "l": "lineTo",
  "r": "rect",
  "z": "closePath",
  "a": "ellipse",
  "d": "drawImage",
};

// Update the current slider value (each time you drag the slider handle)
document.getElementById("myRange").oninput = function() {
  setScale(this.value);
}
document.getElementById("fill_check").oninput = function() {
  updateScreen();
}

function rebuild(){
  var arr, text = document.getElementById("opstext").value;
  try {
    arr = eval(text);
  } catch(e) {
  var svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?> <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.0" width="21.600000" height="24.000000"><path d="'+ text +'" style="fill:#000000;fill-opacity:1.0000000"/></svg>';
    var data = "data:image/svg+xml;base64,"+ btoa(svg);
    var img = new Image();
    img.onload = function(){
      operations = [['d', [img, 0, 0]]];
      updateScreen();
    }
    console.log(svg);
    img.src = data;
    return;
  }
  operations = arr;

  updateScreen();
}
function setScale(s) {
  Scale = parseFloat(s)/10;
  document.getElementById("rate").value = Scale;
  updateScreen();
}

function updateScreen() {
  Container.width = Container.width;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(600, 600);
  ctx.strokeStyle = 'red';
  ctx.moveTo(0, -600), ctx.lineTo(0, 600);
  ctx.moveTo(-600, 0), ctx.lineTo(600, 0);
  ctx.stroke();
  ctx.strokeStyle = 'black';

  ctx.scale(Scale, Scale);
  ctx.lineWidth = 1/Scale;

  drawOps(ctx, operations);
}

function svgTreat(g) {
  function TransformedElement(g, func){
    var trans = g.transform && g.transform.baseVal.length && g.transform.baseVal[0];

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
      TransformedElement(g, function(){
        operations = operations.concat(parse(g.attributes["d"].nodeValue));
      });
      break;
    case 'line':
      var x1 = g.attributes["x1"], y1 = g.attributes["y1"],
          x2 = g.attributes["x2"], y2 = g.attributes["y2"];

      operations.push(['m', [parseFloat(x1.value), parseFloat(y1.value)]]);
      operations.push(['l', [parseFloat(x2.value), parseFloat(y2.value)]]);
      break;
    case 'rect':
      TransformedElement(g, function(){
        var x = g.attributes["x"], y = g.attributes["y"],
            width = g.attributes["width"], height = g.attributes["height"];

        operations.push(['r', [parseFloat(x.value), parseFloat(y.value), parseFloat(width.value), parseFloat(height.value)]]);
      });
      break;
    case 'g':
      for (var tag of g.children) {
        TransformedElement(g, function(){
          svgTreat(tag);
        });
      }
      break;
  }
}

function load(file) {
  $.get({
    url: "../svg/"+file,
    success: function(data, status) {
      if (status != 'success' || typeof data == "string")
        return;
      var g = data.children[0];
      operations = [];
      svgTreat(g);

      translate();
      updateScreen();
      console.log(operations);
      textOps();
    }
  });
}

function textOps() {
  var buf = "[";
  for (var op of operations) {
    buf += "['"+op[0]+"',[";
    for (var n in op[1]) {
      if (n>0) buf += ",";
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
    if (ch == 'e' || ch=='E'){
      if (lastIsNum) {
        arr[arr.length-1] += 'e';
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
      var last = arr[arr.length-1];
      if (lastIsNum && last.substr(last.length-1) == 'e') {
        arr[arr.length-1] += ch;
      } else {
        arr.push(ch);
        lastIsNum = true;
      }
    } else if (ch == '.'){
      if (lastIsNum) {
        arr[arr.length-1]+='.';
      } else {
        arr.push('0.');
        lastIsNum = true;
      }
    } else {
      lastIsNum = false;
    }
  }

  console.log(arr);
  var result = [], op;
  var curpos = [0, 0], preCe, preE, pre, ppre;
  for (var i = 0, ce, e; e = arr[i]; i++) {
    ce = e.toUpperCase();
    if ('A' <= ce.charAt(0) && ce.charAt(0)<='Z') {
      preE = ce!=e;
      i++;
    } else {
      if (preCe == 'M') preCe = 'L';
      ce = preCe;
    }
    switch(ce) {
      case 'A':
        op = ['a', arr.slice(i,i+=7).map(parseFloat)];
        break;
      case 'M':
        op = ['m', arr.slice(i,i+=2).map(parseFloat)];
        if (preE) {
          op[1][0] += curpos[0];
          op[1][1] += curpos[1];
        }
        break;
      case 'L':
        op = ['l', arr.slice(i,i+=2).map(parseFloat)];
        if (preE) {
          op[1][0] += curpos[0];
          op[1][1] += curpos[1];
        }
        break;
      case 'C':
        op = ['c', arr.slice(i,i+=6).map(parseFloat)];
        if (preE) {
          for (var point_i = 0; point_i<3; point_i++) {
            op[1][point_i*2] += curpos[0];
            op[1][point_i*2+1] += curpos[1];
          }
        }
        break;
      case 'S':
        op = ['s', arr.slice(i,i+=4).map(parseFloat)];
        if (preE) {
          for (var point_i = 0; point_i<2; point_i++) {
            op[1][point_i*2] += curpos[0];
            op[1][point_i*2+1] += curpos[1];
          }
        }
        pre = result[result.length-1];
        if (funcs[pre[0]] == 'bezierCurveTo') {
          op[1] = pre[1].slice(4,6).concat(op[1]);
          op[1][0] *= 2, op[1][1] *= 2;
          op[1][0] -= pre[1][2], op[1][1] -= pre[1][3];
        } else if (pre[0] == 'l') {
          ppre = result[result.length-2];
          op[1] = pre[1].concat(op[1]);
          op[1][0] *= 2, op[1][1] *= 2;
          op[1][0] -= ppre[1][ppre[1].length-2], op[1][1] -= ppre[1][ppre[1].length-1];
        } else {
          console.error("s must follow c or s");
        }
        break;
      case 'Q':
        op = ['q', arr.slice(i,i+=4).map(parseFloat)];
        op[1] = op[1].slice(0,2).concat(op[1]);
        if (preE) {
          for (var point_i = 0; point_i<3; point_i++) {
            op[1][point_i*2] += curpos[0];
            op[1][point_i*2+1] += curpos[1];
          }
        }
        break;
      case 'T':
        op = ['t', arr.slice(i,i+=2).map(parseFloat)];
        if (preE) {
          op[1][0] += curpos[0];
          op[1][1] += curpos[1];
        }
        pre = result[result.length-1];
        if (funcs[pre[0]] == 'bezierCurveTo') {
          var tmpop = pre[1].slice(4,6);
          tmpop[1][0] *= 2, tmpop[1][1] *= 2;
          tmpop[1][0] -= pre[1][2], tmpop[1][1] -= pre[1][3];
          op[1] = tmpop.concat(tmpop).concat(op[1]);
        } else if (pre[0] == 'l') {
          ppre = result[result.length-2];
          var tmpop = pre[1].concat();
          tmpop[1][0] *= 2, tmpop[1][1] *= 2;
          tmpop[1][0] -= ppre[1][ppre[1].length-2], tmpop[1][1] -= ppre[1][ppre[1].length-1];
          op[1] = tmpop.concat(tmpop).concat(op[1]);
        } else {
          console.error("s must follow c or s");
        }
        break;
      case 'Z':
          op = ['z',[]]
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
        curpos = op[1].slice(op[1].length-2);

    result.push(op);
    preCe = ce;
  }
  return result;
}

function drawOps(ctx, ops) {
  for (var i = 0, op; op = ops[i]; i++) {
    ctx[funcs[op[0]]](...op[1]);
  }

  if (document.getElementById("fill_check").checked) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function translate() {
  return ;
  var oX = null, oY = null;
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
        op[1][j+1] -= oY;
      }
  }
}

function makePath() {
  var curPos = [0, 0];
  var buf = '', pos;

  for (var i = 0, op = operations[i]; op = operations[i]; i++) {
    pos = op[1];
    switch (op[0]) {
      case 'm':
        buf += "M"+pos.join(",");
        curPos = pos.concat();
        break;
      case 'l':
        if (pos[0] == curPos[0]) {
          buf += "V"+pos[1];
        } else if (pos[1] == curPos[1]) {
          buf += "H"+pos[0];
        } else {
          buf += "L"+pos.join(",");
        }
        break;
      case 'c':
        buf += "C"+pos.join(",");
        break;
      case 'z':
        buf += 'z';
        break;
      case 'r':
        buf += "M"+pos.slice(0,2).join(",")+"h"+pos[2]+"v"+pos[3]+"h-"+pos[2]+"z";
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
  ctx.transform(1,0,0,1,-230.94800510210916,-533.6566036478616);
  var tr = ctx.getTransform();
  var param = [tr.a, tr.b, tr.c, tr.d, tr.e, tr.f];
  console.log(param);
  ctx.restore();
}


