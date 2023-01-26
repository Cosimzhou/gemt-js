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

class GStrokeConstraint {
  _offset: number
  _flags: any
  obj: object
  constructor(off: number, flag: any, obj: GStroke){
    this._offset = off;
    this._flags = flag;
    this.obj = obj;
  }
}

class GStrokeFix {
  _constraints: Array<GStrokeConstraint>
  constructor() {
    this._constraints = [];
  }
  get length(): number { return this._constraints.length; }
  push(c: GStrokeConstraint): void { this._constraints.push(c);}
}

  enum GStrokeConstraintType {
    ConstraintX = 1,
    ConstraintX2 = 2,
    ConstraintParallelHorizon = 4,
    ConstraintY = 64,
    ConstraintY2 = 8,
    ConstraintXCenter = 16,
    ConstraintTopOn = 32,
  };
class GStroke {
  kind: string
  x: number
  y: number
  args: Array<any>
  ext: any
  opt: any
  fix: GStrokeFix

  constructor(...args: any) {
    //   var ops = [...arguments];
    var ops = [...args];
    this.kind = ops.shift();
    this.x = ops.shift();
    this.y = ops.shift();
    this.args = ops;
  }


  symbol = function() {
    var sym = {
      "kind": this.kind,
      "x": this.x,
      "y": this.y,
      "args": this.args,
      "curveArgs": this.curveArgs.bind(this),
    };
    return sym;
  }

  _attach(obj: GStroke, flag: any, offsetX: number = 0): GStroke {
    if (this.fix == null) {
      this.fix = new GStrokeFix();
    }

    this.fix.push(new GStrokeConstraint(offsetX, flag, obj));
    return this;
  }

  detach(flag): GStroke {
    if (this.fix == null) {
      return this;
    }

    var len = this.fix.length;
    for (var i = 0; i < len; i++) {
      if (this.fix._constraints[i]._flags == flag) {
        this.fix._constraints[i--] = this.fix._constraints[--len];
      }
    }

    if (len) {
      var howmany = this.fix.length - len;
      if (howmany > 0) {
        this.fix._constraints.splice(len, howmany);
      }
    } else {
      delete this.fix;
    }
    return this;
  }

  _settle(fn?: (v:number)=>number, fny?: (v:number)=>number): void {
    if (fn) this.x = fn(this.x);
    if (fny) this.y = fny(this.y);

    switch (this.kind) {
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

    if (this.fix == null) {
      return;
    }

    for (var con, i = 0; con = this.fix._constraints[i]; i++) {
      // GStrokeConstraint.ConstraintX
      if (con._flags & GStrokeConstraintType.ConstraintX) {
        this.x = con._offset + con.obj.x;
      }

      // GStrokeConstraint.ConstraintX2
      if (con._flags & GStrokeConstraintType.ConstraintX2) {
        this.args[0] = con._offset + con.obj.x;
      }

      // GStrokeConstraint.ConstraintParallelHorizon
      if (con._flags & GStrokeConstraintType.ConstraintParallelHorizon) {
        // assert this.kind == 'lineH' and con.obj.kind == 'lineH'
        // special treat for parallel horizontal lines
        var ow = con.obj.args[0] - con.obj.x,
          oh = con.obj.args[1] - con.obj.y;
        var k = oh / ow,
          b = con.obj.y - con.obj.x * k +
          (con._offset > 0 ? con.obj.args[2] : -this.args[2]) +
          con._offset / Math.sqrt(1 + k * k);
        this.y = k * this.x + b;
        this.args[1] = k * this.args[0] + b;
      }

      // GStrokeConstraint.ConstraintY
      if (con._flags & GStrokeConstraintType.ConstraintY) {
        this.y = con._offset + con.obj.y;
      }

      // GStrokeConstraint.ConstraintY2
      if (con._flags & GStrokeConstraintType.ConstraintY2) {
        // assert this.kind == 'Vline'
        this.args[0] = con._offset + con.obj.y;
      }

      // GStrokeConstraint.ConstraintXCenter
      if (con._flags & GStrokeConstraintType.ConstraintXCenter) {
        // assert this.kind == 'lineWh'
        var width = con.obj.args[0] || 0;
        if (con.obj.kind == 'lineH') {
          var centerX = con._offset + con.obj.x + width;
          this.x = (centerX - (this.args[0] || 0)) / 2;
        } else {
          if (width == 0 && this.kind == 'draw') {
            var img = g_GInfo.get(this.args[4]);
            width = img ? img.width : 0;
          }

          var centerX = con._offset + con.obj.x + width / 2;
          this.x = centerX - (this.args[0] || 0) / 2;
        }
      }

      // GStrokeConstraint.ConstraintTopOn
      if (con._flags & GStrokeConstraintType.ConstraintTopOn) {
        // assert this.kind == 'draw'
        var h = 6; //this.args[1];
        this.y = con._offset - h;
      }
    }
  }

  rightX(): number {
    //return this.kind=='rect'? this.x+this.args[0]: this.x;
    return this.x;
  }

  curveArgs(): Array<number> {
    if (this.kind.substring(this.kind.length - 5) != 'curve') {
      return null;
    }

    var op = this;
    var args = Array(2);
    var Dx = op.args[0],
      Dy = op.args[1];
    var dx = (Dx - op.x) / 3,
      dy = (Dy - op.y) / 3;
    var dist = Math.sqrt(dx * dx + dy * dy),
      epsilon = Math.asin((dist / 2 - (op.args[2] || 1)) / dist);
    var theta = Math.PI / 6;
    if (epsilon * 2 < theta) epsilon = theta / 2;
    // Stroke the outer front half curve
    var x = dx * Math.cos(theta) + dy * Math.sin(theta),
      y = -dx * Math.sin(theta) + dy * Math.cos(theta);
    // Stroke the outer post half curve
    theta = Math.PI - theta;
    var x1 = dx * Math.cos(theta) + dy * Math.sin(theta),
      y1 = -dx * Math.sin(theta) + dy * Math.cos(theta);
    args[0] = [op.x + x, op.y + y, Dx + x1, Dy + y1, Dx, Dy];

    // Stroke the inner post half curve
    theta = epsilon;
    x = dx * Math.cos(theta) + dy * Math.sin(theta),
      y = -dx * Math.sin(theta) + dy * Math.cos(theta);
    // Stroke the inner front half curve
    theta = Math.PI - theta;
    x1 = dx * Math.cos(theta) + dy * Math.sin(theta),
      y1 = -dx * Math.sin(theta) + dy * Math.cos(theta);
    args[1] = [Dx + x1, Dy + y1, op.x + x, op.y + y, op.x, op.y];

    return args;
  }
}
