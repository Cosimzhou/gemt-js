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

exports.GStroke = GStroke;
GStroke.Const = {
  ConstraintX:                1,
  ConstraintX2:               2,
  ConstraintParallelHorizon:  4,
  ConstraintY2:               8,
  ConstraintXCenter:          16,
};

GStroke.prototype.symbol = function() {
  var sym = {
    "kind": this.kind,
    "x": this.x,
    "y": this.y,
    "args": this.args,
    "curveArgs": this.curveArgs.bind(this),
  };
  return sym;
}

GStroke.prototype._attach = function(obj, flag, offsetX = 0) {
  if (this.fix == null) {
    this.fix = {_constraints: []};
  }

  this.fix._constraints.push({
    _offsetX: offsetX,
    _flags: flag,
    obj: obj
  });
  return this;
}

GStroke.prototype.detach = function(flag) {
  if (this.fix == null) {
    return this;
  }

  var len = this.fix._constraints.length;
  for (var i = 0; i < len; i++) {
    if (this.fix._constraints[i]._flags == flag) {
      this.fix._constraints[i--] = this.fix._constraints[--len];
    }
  }

  if (len) {
    var howmany = this.fix._constraints.length - len;
    if (howmany > 0) {
      this.fix._constraints.splice(len, howmany);
    }
  } else {
    delete this.fix;
  }
  return this;
}

GStroke.prototype._settle = function(fn, fny = null) {
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

  if (this.fix == null || this.fix._constraints == null) {
    return;
  }

  for (var con, i = 0; con = this.fix._constraints[i]; i++) {
    if (con._flags & GStroke.Const.ConstraintX) { // GStroke.Const.ConstraintX
      this.x = con._offsetX + con.obj.x;
    }
    if (con._flags & GStroke.Const.ConstraintX2) { // GStroke.Const.ConstraintX2
      this.args[0] = con._offsetX + con.obj.x;
    }
    if (con._flags & GStroke.Const.ConstraintParallelHorizon) { // GStroke.Const.ConstraintParallelHorizon
      // assert this.kind == 'lineH' and con.obj.kind == 'lineH'
      // special treat for parallel horizontal lines
      var ow = con.obj.args[0] - con.obj.x, oh = con.obj.args[1] - con.obj.y;
      var k = oh / ow,
          b = con.obj.y - con.obj.x * k +
          (con._offsetX > 0 ? con.obj.args[2] : -this.args[2]) +
          con._offsetX / Math.sqrt(1 + k * k);
      this.y = k * this.x + b;
      this.args[1] = k * this.args[0] + b;
    }
    if (con._flags & GStroke.Const.ConstraintY2) { // GStroke.Const.ConstraintY2
      // assert this.kind == 'Vline'
      this.args[0] = con._offsetX + con.obj.y;
    }
    if (con._flags & GStroke.Const.ConstraintXCenter) { // GStroke.Const.ConstraintXCenter
      // assert this.kind == 'lineWh'
      var width = con.obj.args[0] || 0;
      if (con.obj.kind == 'lineH') {
        var centerX = con._offsetX + con.obj.x + width;
        this.x = (centerX - (this.args[0] || 0)) / 2;
      } else {
        var centerX = con._offsetX + con.obj.x + width / 2;
        this.x = centerX - (this.args[0] || 0) / 2;
      }
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
  var dx = (Dx - op.x) / 3, dy = (Dy - op.y) / 3;
  var dist = Math.sqrt(dx * dx + dy * dy),
      epsilon = Math.asin((dist / 2 - (op.args[2] || 1)) / dist);
  var theta = Math.PI / 6;
  if (epsilon * 2 < theta) epsilon = theta / 2;
  // Stroke the outer front half curve
  var x = dx * Math.cos(theta) + dy * Math.sin(theta),
      y = -dx * Math.sin(theta) + dy * Math.cos(theta);
  // Stroke the outer post half curve
  theta = Math.PI - theta;
  var x1 =dx * Math.cos(theta) + dy * Math.sin(theta),
      y1 =-dx * Math.sin(theta) + dy * Math.cos(theta);
  args[0] = [op.x + x, op.y + y, Dx + x1, Dy + y1, Dx, Dy];

  // Stroke the inner post half curve
  theta = epsilon;
  x = dx * Math.cos(theta) + dy * Math.sin(theta),
  y = -dx * Math.sin(theta) + dy * Math.cos(theta);
  // Stroke the inner front half curve
  theta = Math.PI - theta;
  x1 = dx * Math.cos(theta) + dy * Math.sin(theta),
  y1 = -dx *Math.sin(theta) + dy * Math.cos(theta);
  args[1] = [Dx + x1, Dy + y1, op.x + x, op.y + y, op.x, op.y];

  return args;
}

