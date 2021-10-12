/********************************
 *
 * GRect
 *
 * @constructor
 *******************************/
function GRect(w, h, x = null, y = null) {
  this.width = w;
  this.height = h;
  this.x = x;
  this.y = y;
  this.ax = 0;
  this.ay = 0;
}
exports.GRect = GRect;

GRect.prototype.setAnchor = function(ax, ay) {
  this.ax = ax;
  this.ay = ay;
  return this;
}

GRect.prototype.fix = function() {
  this.top = this.y;
  this.left = this.x;
  this.right = this.x + this.width;
  this.bottom = this.y + this.height;
  return this;
}

GRect.prototype._budget = function(x, y, w = null, h = null) {
  var spc = new GRect(this.width, this.height);
  spc.x = x - this.ax;
  spc.y = y - this.ay;
  spc.fix();
  return spc;
}

GRect.prototype.hit = function(spc) {
  //return !(this.left >= spc.right || this.right <= spc.left || this.top >= spc.bottom || this.bottom <= spc.top);
  return this.left < spc.right &&
    this.right > spc.left &&
    this.top < spc.bottom &&
    this.bottom > spc.top;
}

GRect.prototype.expend = function(gap = 4) {
  this.x -= gap;
  this.y -= gap;
  gap <<= 1;
  this.width += gap;
  this.height += gap;
  return this;
}

GRect.prototype.union = function(g) {
  if (g.right > this.right) this.right = g.right;
  if (g.bottom > this.bottom) this.bottom = g.bottom;
  if (g.left < this.left) this.left = g.left;
  if (g.top < this.top) this.top = g.top;
  return this;
}

GRect.prototype.clear = function(g) {
  this.left = this.top = Infinity;
  this.right = this.bottom = -Infinity;
  return this;
}

GRect.prototype.shift = function(x, y) {
  this.x += x;
  this.y += y;
  this.left += x;
  this.right += x;
  this.top += y;
  this.bottom += y;
  return this;
}
