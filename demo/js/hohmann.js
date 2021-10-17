/*************************************************************************
    > File Name: hohmann.js
    > Author: cosim
    > Mail: cosimzhou@hotmail.com
    > Created Time: 四  3/ 5 12:36:37 2020
 ************************************************************************/

var MelodyDict = [];
(function() {

var m, p = {linkPrev : 1}, l3 = {tuplet : 3};

function bindvz(r, o) {
  var obj = o || p;
  if (typeof (r) == 'number')
    r = [ r, 4 ];
  for (var prop in obj)
    r[prop] = obj[prop];
  return r;
}

function barl(type) {
  return { kind: "barline", type: type }
}

function mark(kind, type = 0) { return {kind : kind, type : type}; }

function property(m, opts) {
  for (var prop in opts)
    m[prop] = opts[prop];
}

function pushproperty(ms, opts) {
  for (var i = 0, m; m = ms[i]; ++i) {
    property(m, opts);
  }
  property(ms, opts);
  MelodyDict.push(ms);
}
////////////////////////////////////////////////////////////
m = [
  [
    [ 0, 4 ],
    [ 2, 4 ],
    [ 4, 2 ],
    [ -1, 4 ],
    [ 0, 4 ],
    [ 2, 2 ],
    [ -3, 4 ],
    [ -1, 4 ],
    0,
    0,
    bindvz([ 2, 4 ], p),
    4,
    [ 2, 2 ],
    0,
    2,
    [ 4, 2 ],
    [ -1, 4 ],
    [ 0, 4 ],
    [ 2, 2 ],
    [ -3, 4 ],
    [ -1, 4 ],
    0,
    4,
    bindvz([ 2, 4 ], p),
    -1,
    [ 0, 2 ],
    barl(7),
    -1,
    0,
    [ 2, 2 ],
    4,
    2,
    [ 0, 2 ],
    2,
    0,

    -1,
    2,
    bindvz(0),
    -1,
    [ -3, 2 ],
    -1,
    0,
    [ 2, 2 ],
    4,
    2,
    [ 0, 2 ],
    2,
    0,
    -1,
    2,
    0,
    4,
    [ 2, 2 ],
    0,
    2,
    [ 4, 2 ],
    2,
    4,
    [ 2, 2 ],
    -3,
    -1,

    0,
    0,
    bindvz(2),
    4,
    [ 2, 2 ],
    0,
    2,
    [ 4, 2 ],
    -1,
    0,
    [ 2, 2 ],
    -3,
    -1,
    0,
    4,
    bindvz(2),
    -1,
    [ 0, 2 ],
    barl(4)
    // End Track
  ],
  [
    [ null, 2 ], [ -12, 4 ],  [ -5, 4 ],   [ null, 2 ],
    [ -7, 4 ],   [ -10, 4 ],  [ null, 2 ], -8,
    -8,          -10,         -12,         -13,
    -17,         [ null, 2 ], [ -12, 4 ],  [ -5, 4 ],
    [ null, 2 ], [ -7, 4 ],   [ -10, 4 ],  [ null, 2 ],
    -8,          -12,         -7,          -5,
    [ -8, 2 ],   [ null, 2 ], -1,          -10,
    [ null, 2 ], -3,          -10,         -6,
    -10,

    -5,          -1,          -3,          -5,
    -6,          -10,         [ null, 2 ], -1,
    -10,         [ null, 2 ], -3,          -10,
    -6,          -10,         -5,          -7,
    -8,          -12,         [ -5, 2 ],   [ null, 2 ],
    -12,         -5,          [ null, 2 ], -7,
    -10,         [ null, 2 ], -8,          -8,
    -10,         -12,         -13,         -17,
    [ null, 2 ], -12,         -5,          [ null, 2 ],
    -7,          -10,         [ null, 2 ],

    -8,          -12,         -7,          -5,
    [ -12, 2 ]
    // End Track
  ]
];

pushproperty(m, {
  name : "小饶舌者",
  pickup : 2,
  base : 72,
  tone : 0,
  min : 4,
  dem : 4,
  abs : true,
  multitrack : true,
});
})();
