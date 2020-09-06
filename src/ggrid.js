
function GGrid(w, h) {
  this.width = w >> 6;
  this.height = h >> 6;
  this.clear();
}
exports['GGrid'] = GGrid;
GGrid.prototype.clear = function() {
  this.array = [];
  this.arr = Array(this.height);
  for (var i = 0; i < this.height; ++i) {
    this.arr[i] = Array(this.width);
    for (var j = 0; j < this.width; ++j) {
      this.arr[i][j] = [];
    }
  }
  var r = this.overall = new GRect();
  r.left = r.top = Infinity;
  r.right = r.bottom = -Infinity;
}
GGrid.prototype.enumerate = function(g, act) {
  var l = g.left >> 6, t = g.top >> 6,
      r = (g.right >> 6) + (g.right % 64? 1:0),
      b = (g.bottom >> 6) + (g.bottom % 64? 1:0);

  if (l < 0) l = 0;
  if (t < 0) t = 0;
  if (r > this.width) r = this.width;
  if (b > this.height) b = this.height;

  var flag;
  for (var x = l; x < r; ++x) {
      for (var y = t; y < b; ++y) {
          flag = act(this.arr[y][x], g);
          if (flag) return flag;
      }
  }
}
GGrid.prototype.put = function(g){
  this.array.push(g);
  this.enumerate(g, function (arr, g) {
    arr.push(g);
  });
  this.overall.union(g);
}
GGrid.prototype.hit = function(g) {
  if (!this.overall.hit(g))
    return false;

  var ret = false;
  this.enumerate(g, function(arr, g) {
    for (var h of arr) {
      if (h.hit(g)) {
        ret = h;
        return true;
      }
    }
  });

  return ret;
}


