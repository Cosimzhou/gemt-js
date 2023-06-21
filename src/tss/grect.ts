/********************************
 *
 * GRect
 *
 * @constructor
 *******************************/
class GRect {
  width: number;
  height: number;
  x: number;
  y: number;
  ax: number;
  ay: number;
  top: number;
  bottom: number;
  left: number;
  right: number;

  constructor(
    w: number = null,
    h: number = null,
    x: number = null,
    y: number = null
  ) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.ax = 0;
    this.ay = 0;
  }

  setAnchor(ax: number, ay: number): GRect {
    this.ax = ax;
    this.ay = ay;
    return this;
  }

  fix(): GRect {
    this.top = this.y;
    this.left = this.x;
    this.right = this.x + this.width;
    this.bottom = this.y + this.height;
    return this;
  }

  _budget(x: number, y: number, w: number = null, h: number = null): GRect {
    var spc = new GRect(w || this.width, h || this.height);
    spc.x = x - this.ax;
    spc.y = y - this.ay;
    spc.fix();
    return spc;
  }

  hit(spc: GRect): boolean {
    return (
      this.left < spc.right &&
      this.right > spc.left &&
      this.top < spc.bottom &&
      this.bottom > spc.top
    );
  }

  expend(gap: number = 4): GRect {
    this.x -= gap;
    this.y -= gap;
    gap <<= 1;
    this.width += gap;
    this.height += gap;
    return this;
  }

  union(g: GRect): GRect {
    if (g.right > this.right) this.right = g.right;
    if (g.bottom > this.bottom) this.bottom = g.bottom;
    if (g.left < this.left) this.left = g.left;
    if (g.top < this.top) this.top = g.top;
    return this;
  }

  clear(): GRect {
    this.left = this.top = Infinity;
    this.right = this.bottom = -Infinity;
    return this;
  }

  shift(x: number, y: number): GRect {
    this.x += x;
    this.y += y;
    this.left += x;
    this.right += x;
    this.top += y;
    this.bottom += y;
    return this;
  }
}
