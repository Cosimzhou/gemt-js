/********************************
 *
 * Utils
 *
 *******************************/
var exports = (typeof window !== 'undefined') ? window : {};
var _ = 0;
var MIDI = {};

function extend(child, parent) {
  // add the following into child function at first line:
  // parent.apply(this, ...arguments);
  function T() {}
  T.prototype = parent.prototype;
  child.prototype = new T();
  child.prototype.constructor = child;
}

function impl(child, interf) {
  function T(func) {
    return function() {
      console.error("CAUTION: class " + child.name +
        " should implement function " + func.name +
        ", but didn't. It should be " + func.toString());
    }
  }

  for (var k in interf) {
    child.prototype[k] = T(interf[k]);
  }
}

function clone(o) {
  if (typeof o != 'object') return (o);
  if (o == null) return (o);
  var ret = (typeof o.length == 'number') ? [] : {};
  for (var key in o) ret[key] = clone(o[key]);
  return ret;
};

function LargePowerOf2(x) {
  x |= (x >> 1);
  x |= (x >> 2);
  x |= (x >> 4);
  x |= (x >> 8);
  x |= (x >> 16);
  return (x & ~(x >> 1));
}

function CountBits(bits) {
  bits = bits - ((bits & 0xAAAAAAAA) >> 1);
  bits = ((bits & 0xCCCCCCCC) >> 2) + (bits & 0x33333333);
  bits = ((bits >> 4) + bits) & 0x0F0F0F0F;
  return (bits * 0x01010101) >> 24;
}

function Log2(n) {
  return n ? CountBits(LargePowerOf2(n) - 1) : -1;
}

function gcd(m, n) {
  if (m < n) {
    var t = m;
    m = n;
    n = t;
  }

  for (var r = 0;
    (r = m % n) != 0;) {
    m = n;
    n = r;
  }

  return n;
}


function Fraction(num, den) {
  this._numerator = num || 0;
  this._denominator = den || 1;
}
Fraction.prototype._reduct = function(f) {
  if (this._denominator == f._denominator) return;
  var product = f._denominator * this._denominator;
  var mcp = product / gcd(f._denominator, this._denominator);
  var rate = mcp / this._denominator;
  this._denominator = mcp;
  this._numerator *= rate;
  return new Fraction(f._numerator * rate, mcp);
}
Fraction.prototype._simplify = function() {
  var rate = 1;
  while (parseInt(this._numerator) !== this._numerator) {
    this._numerator *= 10;
    rate *= 10;
  }
  this._denominator *= rate;

  rate = 1;
  while (parseInt(this._denominator) !== this._denominator) {
    this._denominator *= 10;
    rate *= 10;
  }
  this._numerator *= rate;

  rate = gcd(this._numerator, this._denominator);
  this._numerator /= rate;
  this._denominator /= rate;

  return this;
}

Fraction.prototype.add = function(f) {
  f = this._reduct(f);
  this._numerator += f._numerator;
  return this._simplify();
}
Fraction.prototype.sub = function(f) {
  f = this._reduct(f);
  this._numerator -= f._numerator;
  return this._simplify();
}
Fraction.prototype.imul = function(i) {
  this._numerator *= i;
  return this._simplify();
}
Fraction.prototype.idiv = function(i) {
  this._denominator *= i;
  return this._simplify();
}
Fraction.prototype.value = function() {
  return this._numerator / this._denominator;
}

Fraction.prototype.gt = function(f) { return this.value() > f.value(); }
Fraction.prototype.ge = function(f) { return this.value() >= f.value(); }
Fraction.prototype.lt = function(f) { return this.value() < f.value(); }
Fraction.prototype.le = function(f) { return this.value() <= f.value(); }
Fraction.prototype.ne = function(f) { return this.value() !== f.value(); }
Fraction.prototype.eq = function(f) { return this.value() === f.value(); }
