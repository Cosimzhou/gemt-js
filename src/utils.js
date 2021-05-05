/********************************
 *
 * Utils
 *
 *******************************/
var exports = (typeof window !== 'undefined') ? window : {};
var _ = 0;

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
