/*************************************************************************
    > File Name: melody.js
    > Author: cosim
    > Mail: cosimzhou@hotmail.com
    > Created Time: 四  3/ 5 12:36:37 2020
 ************************************************************************/

var MelodyDict = [];
(function() {

  var m, p = { linkPrev: 1 },
    l3 = bvz([8], { tuplet: 3 }),
    acc = { acciaccatura: true };

  // bind with
  function bvz(r, o) {
    var obj = o || p;
    if (typeof(r) == 'number')
      r = [r, 4];
    for (var prop in obj)
      r[prop] = obj[prop];
    return r;
  }

  function barl(type, opt) {
    return { kind: "barline", type: type, opt: opt }
  }

  function mark(kind, type = 0, opt = null) {
    return { kind: kind, type: type, opt: opt };
  }

  ////////////////////////////////////////////////////////////
  // Dev-test
  m = [
    bvz(14, acc), [12, [2, 4]],
    //  three note in a beat
    [7, l3], [7, l3], [7, l3],
  ];

  m.tone = 0;
  m.base = 60;
  m.min = 2;
  m.dem = 4;
  m.name = "DevTest";
  m.abs = true;
  MelodyDict.push(m);
  ////////////////////////////////////////////////////////////
  // test
  m = [
  bvz([4, 2], { "oum": ["fermata", "triangle", "tsuyoi", "yowai"] }),
  // bar
  //  three note in a beat
  [7, l3], [7, l3], [7, l3], [7, l3], [7, l3], [7, l3],
  // bar
  [4, [8, 16]], [4, 16], [0, [8, 16]], [4, 16],
  // bar
  [2, 4], [0, 8], [null, 8],
  barl(2), bvz([2, 1], { linkPrev: 4, "oum": ["tsuyoi"] }),
];

  m.base = 62;
  m.tone = 2;
  m.min = 2;
  m.dem = 4;
  m.name = "test";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  Knowledge
  m = [
    // bar
    [7, l3], [7, l3], [7, l3], [7, l3], [7, l3], [7, l3],
      barl(5), //  three note in a beat
    // bar
    [4, [8, 16]], [4, 16], [0, [8, 16]], [4, 16],
    // bar
    [2, 4], [0, 8], [null, 8],
    barl(2), [2, 1],
    // repeat begin
    // 上波音  N状折线  NN          NNN
    bvz([12, 4], { "overmarks": ["mordant"] }), barl(2),
      [12, 32], [14, 32], [12, [8, 16]],
    bvz([12, 4], { "overmarks": ["mordant_long"] }), barl(2),
      [12, 32], [14, 32], [12, 32], [14, 32], [12, 8],
    // 下波音  加一道竖线的N状折线
    bvz([12, 4], { "overmarks": ["mordant_lower"] }), barl(2),
      [12, 32], [11, 32], [12, [8, 16]],

    bvz([12], { "overmarks": ["mordant_lower_long"] }), barl(2),
    [12, 32], [11, 32], [12, 32], [11, 32], [12, 8], barl(0, 1),

    //顺回音  横倒的 S
     bvz([12], { "overmarks": ["cadence"] }), barl(2),
      [14, 16], [12, 16], [11, 16], [12, 16], barl(5),
     [12, 32], [14, 32], [12, 32], [11, 32], [12, 8], barl(2),
    //逆回音  加一道竖线的横倒的 S
    [12], [12], [11, 16], [12, 16], [14, 16], [12, 16], [12, 32], [11, 32], [12,
      32], [14, 32], [12, 8], barl(2),
    // S 只一拍
    [12], [16], [12, 8], [14, 32], [12, 32], [11, 32], [12, 32], [16], barl(2),
    // S
    [12], [16], [12, 8], [14, 32], [12, 32], [11, 32], [12, 32], [16], barl(2),
    [12, 2], [12, [4, 8]], [14, 32], [12, 32], [11, 32], [12, 32], barl(2),
  ];

  m.base = 60;
  m.tone = 0;
  m.min = 2;
  m.dem = 4;
  m.name = "Knowledge";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  梁祝
  m = [
  5, 3, 2, [1, [2, 4]], 2,
  -7, -6, [-5, [1, 4]], 7, 6, 7, [5, [4, 8]], [6, 8],
  7, 6, [5, 8], [6, 8], [7, 8], [6, 8], [11, [4, 8]], [6, 8], [5, 8], [6, 8], [5,
      8], [2, 8],

  [3, 8], [4, 8], [3, 8], [2, 8], [1, [2, 4]], 5, 7, 2, -6, 1, [-5, [2, 4]], [-6,
      8], [1, 8], [-5, 1], [-3, 2],
  barl(3), [-5, [4, 8]], bvz([-6, 8]), [1, [4, 8]], bvz([2, 8]),
  [-6, 8], [1, 8], bvz([-5, 4], { linkPrev: 2 }), [5, [4, 8]], bvz([11, 8]),
  [6, [8, 16]], bvz([5, 16]), [3, 8], [5, 8], [2, 1], [2, [4, 8]], bvz([3,
      8]),
  -7, bvz(-6), [-5, [4, 8]], bvz([-6, 8]), 1, bvz(2), -3, bvz(1),
  [-6, [8, 16]], bvz([-5, 16]), [-6, 8], bvz([1, 8]), [-5, 1], [3, [4, 8]],
    bvz([5, 8]),
  -7, bvz(2), [-6, 8], bvz([1, 8]), [-5, [2, 4]], [-3, [8, 16]], [-5, 16],
    bvz(-3, { linkPrev: 2 }),
  [-5, 8], bvz([-6, 8]), [-7, 8], bvz([2, 8]), [-6, [2, 4]], [-5, 8],
    bvz([-6, 8]), [1, [4, 8]], bvz([2, 8]),
  5, bvz(3), 2, [3, 8], bvz([2, 8], { linkPrev: 2 }), 1, [-6, 8], bvz([-
      5, 8], { linkPrev: 2 }),
  [-3, 2], [1, 2], [-6, 8], [1, 8], [-6, 8], [-5, 8], [-3, 8], [-5, 8], [-6, 8],
    bvz([1, 8], { linkPrev: 7 }), // 7
  [-5, [1, 1, 4]], 3,
  barl(4), [-5, [1, 1]]
];

  m.base = 70;
  m.pickup = 1;
  m.min = 4;
  m.dem = 4;
  m.tone = 10;
  m.name = "梁祝";
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  // Camon
  m = [
  // bar
  [0, 8], [0, 16], [0, 16],
  [0, 16], [-5, 16], [-7, 16], [-5, 16],

  // bar
  [0, 8], [0, 16], [0, 16],
  [0, 16], [2, 16], [4, 16], [2, 16],

  // bar
  [0, 8], [0, 16], [0, 16],
  [2, 16], [0, 16], [-1, 16], [0, 16],

  // bar
  [2, 8], [-5, 16], [-3, 16],
  [-1, 16], [0, 16], [-1, 16], [2, 16],

  // bar
  [5, 8], [5, 16], [5, 16],
  [5, 16], [0, 16], [-2, 16], [0, 16],

  // bar
  [5, 8], [5, 16], [5, 16],
  [5, 16], [7, 16], [9, 16], [7, 16],

  // bar
  [5, 8], [5, 16], [4, 16],
  [2, 8], [2, 16], [0, 16],

  // bar
  [-1, 2],

  // bar
  [0, 8], [0, 16], [0, 16],
  [0, 16], [-5, 16], [-7, 16], [-5, 16],

  // bar
  [0, 8], [0, 16], [0, 16],
  [0, 16], [2, 16], [4, 16], [2, 16],

  // bar
  [0, 8], [0, 16], [0, 16],
  [2, 16], [0, 16], [-1, 16], [0, 16],

  // bar
  [2, 8], [-5, 16], [-3, 16],
  [-2, 16], [-1, 16], [2, 16], [7, 16],

  // bar
  [7, 8], [7, 16], [7, 16],
  [7, 16], [5, 16], [3, 16], [5, 16],

  // bar
  [7, 8], [7, 16], [7, 16],
  [7, 16], [5, 16], [3, 16], [5, 16],

  // bar
  [7, 8], [-5, 16], [-3, 16],
  [-1, 8], [-5, 16], [4, 16],

  // bar
  [2, 4], [0, 8], [null, 8],

  // repeat begin

];

  m.base = 74;
  m.tone = 2;
  m.min = 2;
  m.dem = 4;
  m.name = "卡门序曲";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  // Ночь под Москвой
  m = [
  // bar 1
  [-3, 8], [0, 8], [4, 8], [0, 8],

  // bar 2
  [2, 4], [0, 8], [-1, 8],

  // bar 3
  [4, 4], [2, 4],

  // bar 4
  [-3, 2],

  // bar 5
  [0, 8], [4, 8], [7, 8], [7, 8],

  // bar 6
  [9, 4], [7, 8], [5, 8],

  // bar 7
  [4, 2], barl(3),

  // bar 8
  [6, 4], [8, 4],

  // bar 9
  [11, 8], [9, 8], [4, [4, 8]],

  // bar 10
  [-1, 4], [-3, 8],

  // bar 11
  [4, 8], [2, 8], [5, [4, 8]],

  // bar 12
  [null, 8], [7, 8], [5, 8],

  // bar 13
  [4, 4], [2, 8], [0, 8],

  // bar 14
  [4, 4], bvz([2, 4]),

  // bar 15
  [-3, 2], barl(4)
];

  m.tone = 7;
  m.base = 67;
  m.min = 2;
  m.dem = 4;
  m.name = "莫斯科郊外的晚上";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  // 我爱北京天安门
  m = [
  // bar 1
  [7, [8, 16]], [12, 16], [7, 8], [5, 8],

  // bar 2
  [4, 8], [2, 8], [0, 4],

  // bar 3
  [0, 8], [0, 8], [2, 8], [4, 8],

  // bar 4
  [4, 8], bvz([0, 8]), [4, 8], bvz([5, 8]), // ties two

  // bar 5-6
  [7, 1],

  // bar 7
  [7, [8, 16]], [12, 16], [7, 8], [5, 8],

  // bar 8
  [4, 8], [7, 8], [2, 4],

  // bar 9
  [5, [8, 16]], [4, 16], [2, 8], [9, 8],

  // bar 10
  [7, 4], [2, 8], bvz([4, 8]), // ties

  // bar 11-12
  [0, [2, 4]], [null, 4],

  // bar 13
  [7, [4, 8]], [4, 8],

  // bar 14
  [9, 8], [12, 8], [11, 8], [9, 16], bvz([11, 16]), // ties

  // bar 15
  [7, 4], bvz([4, 4]), // ties

  // bar 16
  [14, [8, 16]], [16, 16], [14, 8], [12, 8],

  // bar 17
  [11, 4], [9, 8], bvz([0, 8]),
  // bar 18-19
  [7, 1],

  // bar 20
  [7, [8, 16]], [4, 16], [9, 8], [12, 8],

  // bar 21
  [11, 8], bvz([9, 8]), [11, 8], bvz([12, 8]),

  // bar 22
  [14, 2],

  // bar 23
  [7, [8, 16]], [9, 16], [11, 8], [12, 8],

  // bar 24
  [14, 4], [7, 4],

  // bar 25-26
  [12, [2, 4]], [null, 4],

  // bar 27
  [7, [8, 16]], [12, 16], [7, 8], [5, 8],

  // bar 28
  [4, 8], [2, 8], [0, 4],

  // bar 29
  [0, 8], [0, 8], [2, 8], [4, 8],

  // bar 30
  [4, 8], bvz([0, 8]), [4, 8], bvz([5, 8]), // ties two

  // bar 31-32
  [7, 1],

  // bar 33
  [7, [8, 16]], [12, 16], [7, 8], [5, 8],

  // bar 34
  [4, 8], [7, 8], [2, 4],

  // bar 35
  [5, [8, 16]], [4, 16], [2, 8], [9, 8],

  // bar 36
  [7, 4], [9, 8], [11, 8],

  // bar 37-38
  [12, [2, 4]] //, [null, 4],
];

  m.tone = 0;
  m.base = 60;
  m.min = 2;
  m.dem = 4;
  m.name = "我爱北京天安门";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  m = [
  // bar 1
  [9, [4, 8]], [7, 8], [4], [7],

  // bar 2
  [12], [9, 8], bvz([7, 8]), [9, 2],

  // bar 3
  [4], [7, 8], [9, 8], [7], [4],

  // bar 4
  [0, 8], bvz([-3, 8]), [7, 8], bvz([4, 8]), [2, 2],

  // bar 5
  [2, [4, 8]], [4, 8], [7], [7, 8], [9, 8],

  // bar 6
  [4], bvz([2, 4]), [0, 2],

  // bar 7
  [7, [4, 8]], [4, 8], [2, 8], bvz([0, 8]), [-3, 8], bvz([0, 8]),

  // bar 8
  [-5, [2, 4]], [null, 4]
];

  m.tone = 0;
  m.base = 60;
  m.min = 4;
  m.dem = 4;
  m.name = "世上只有妈妈好";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  小星星
  m = [
  // bar 1 - 2
  0, 0, 7, 7, 9, 9, [7, 2],
  // bar 3 - 4
  5, 5, 4, 4, 2, 2, [0, 2], barl(3),
  // bar 5 - 6
  7, 7, 5, 5, 4, 4, [2, 2],
  // bar 7 - 8
  7, 7, 5, 5, 4, 4, [2, 2],
  // bar 9 - 10
  0, 0, 7, 7, 9, 9, [7, 2],
  // bar 11 - 12
  5, 5, 4, 4, 2, 2, [0, 2], barl(4),
];

  //  m.tone = 2;
  m.base = 60;
  m.min = 4;
  m.dem = 4;
  m.name = "小星星";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  两只老虎
  m = [
  // bar 1 - 2
  0, 2, 4, 0, 0, 2, 4, 0,
  // bar 3 - 4
  4, 5, [7, 2], 4, 5, [7, 2],
  // bar 5
  [7, [8, 16]], [9, 16], [7, [8, 16]], [5, 16], [4], [0],
  // bar 6
  [7, [8, 16]], [9, 16], [7, [8, 16]], [5, 16], [4], [0],
  // bar 7 - 8
  0, -5, [0, 2], 0, -5, [0, 2],
];

  m.tone = 0;
  m.base = 60;
  m.min = 4;
  m.dem = 4;
  m.name = "两只老虎";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  // 祝你生日快乐
  m = [
  // bar 1
  [-5, 8], [-5, 8],
  // bar 2
  -3, -5, 0,
  // bar 3
  [-1, 2], [-5, 8], [-5, 8],
  // bar 4
  -3, -5, 2,
  // bar 5
  [0, 2], [-5, 8], [-5, 8],
  // bar 6
  7, 4, 0,
  // bar 7
  [-1], bvz([-3, 4], p), [5, 8], [5, 8], // 6 平滑音
  // bar 8
  4, 0, 2,
  // bar 9
  [0, 2]
];

  m.tone = 5;
  m.pickup = 2;
  m.base = 65;
  m.min = 3;
  m.dem = 4;
  m.name = "祝你生日快乐";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  新年好
  m = [
  [0, 8], [0, 8],
  [0], [-5], [4, 8], [4, 8],
  [4], [0], [0, 8], [4, 8],
  [7], [7], [5, 8], [4, 8],
  [2, 2], [2, 8], [4, 8],
  [5], [5], [4, 8], [2, 8],
  [4], [0], [0, 8], [4, 8],
  [2], [-5], [-1, 8], [2, 8],
  [0, [2, 4]]
];

  m.tone = 2;
  m.base = 62;
  m.pickup = 2;
  m.min = 3;
  m.dem = 4;
  m.name = "新年好";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  上学歌
  m = [
  // bar 1
  [0, 8], [2, 8], [4, 8], [0, 8],
  // bar 2
  [7, 2],
  // bar 3
  [9, 8], [9, 8], [12, 8], [9, 8],
  // bar 4
  [7, 2],
  // bar 5
  [9, 8], [9, 8], [12],
  // bar 6
  [7, 8], [9, 8], [4],
  // bar 7
  [9, 8], [7, 8], [4, 8], [7, 8],
  // bar 8
  [4, 8], [0, 8], [2, 8], [4, 8],
  // bar 9
  [0, 2]
];

  m.tone = 0;
  m.base = 60;
  m.min = 2;
  m.dem = 4;
  m.name = "上学歌";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  义勇军进行曲
  m = [
  // bar 1
  [0, [8, 16]], [4, 16], [7, 8], [7, 8],
  // bar 2
  [9], [7],
  // bar 3
  [4, [8, 16]], [0, 16], [7, l3], [7, l3], [7, l3], //  three note in a beat
  // bar 4
  [4], [0],
  // bar 5
  [7, l3], [7, l3], [7, l3], [7, l3], [7, l3], [7, l3], // three note in a beat
  // bar 6
  [0], [null, 8], [-5, 8],
  // bar 7
  [0, [4, 8]], [0, 8],
  // bar 8
  [0, [8, 16]], [0, 16], [-5, 8], [-3, 16], [-1, 16],
  // bar 9
  [0], [0],
  // bar 10
  [null, 8], [4, 8], [0, 8], [2, 16], bvz([4, 16]),
  // bar 11
  [7, [8, 16]], [7, 16], [7],
  // bar 12
  [4, [8, 16]], [4, 16], [0, [8, 16]], [4, 16],
  // bar 13-14
  [7, [8, 16]], [4, 16], [2], [2, 2],
  // bar 15-16
  [9], [7], [2], [4],
  // bar 17
  [7, 8], [4, 8], [null, 8], [7, 8],
  // bar 18-19
  [4, 8], [2, 16], [4, 16], [0], [4], [null],
  // bar 20
  [-5, [8, 16]], [-3, 16], [0, 8], [0, 8],
  // bar 21
  [4, [8, 16]], [4, 16], [7, 8], [7, 8],
  // bar 22-23
  [2, 8], [2, 16], [2, 16], [-3], [2, [4, 8]], [-5, 8],
  // bar 24-26
  [0, [4, 8]], [0, 8], [4, [4, 8]], [4, 8], [7, 2],
  // bar 27
  [0, [8, 16]], [4, 16], [7, 8], [7, 8],
  // bar 28
  [9], [7],
  // bar 29
  [4, [8, 16]], [0, 16], [7, l3], [7, l3], [7, l3], // three note in a beat
  // bar 30
  [4, 8], [null, 8], [0, 8], [null, 8],
  // bar 31
  [-5], [0],
  // bar 32
  [4, [8, 16]], [0, 16], [7, l3], [7, l3], [7, l3], // three note in a beat
  // bar 33
  [4, 8], [null, 8], [0, 8], [null, 8],
  // bar 34-37
  [-5], [0], [-5], [0], [-5], [0], [0], [null],
];

  m.tone = 7;
  m.base = 67;
  m.min = 2;
  m.dem = 4;
  m.name = "义勇军进行曲";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  没有共产党就没有新中国
  m = [
  11, 5, [6, 8], [6, 8], [5, 8], [6, 8],
  [11, [8, 16]], [11, 16], [6, 8], [11, 8], [12, 2], 13, 12,
  [11, [8, 16]], [13, 16], [12, 8], [11, 8], [6, [8, 16]], [12, 16], [11, 8], [6,
      8], [5, 2],
  11, 6, [11, 2], [3, 8], [11, 8], [6, 8], [5, 8], [6, 2], 3, 11, [6, [4, 8]],
    bvz([5, 8]),
  [12, [8, 16]], [11, 16], [6, 8], [5, 8], [6, 2], 3, [11, 8], [11, 16], [11, 16],
    6, 3,
  [3, 8], [5, 16], [5, 16], 6, [6, 2], 13, [12, 8], [11, 16], [11, 16], 12, 5, [6,
      8], [11, 8], 12,
  [12, [4, 8]], [5, 8], [3, 8], [3, 16], [3, 16], [5, 8], [5, 8], [6, 8], [6, 8],
    [5, 8], [6, 8],
  [11, 8], [11, 16], [11, 16], [6, 8], [12, 8], [7, 8], bvz([6, 8]), [5, 8], [
      6, 8],
  [12, 8], [12, 16], [12, 16], [11, 8], [12, 8], [13, 8], [13, 8], [12, 8], [11,
      8], [6, 8],
  [6, 16], [6, 16], [11, 8], [11, 8], [12, 8], bvz([11, 8]), [6, 8], bvz([
      11, 8]), [5, 2],
  [11, 8], [5, 8], [6, 8], [11, 8], [5, [4, 8]], [6, 8], [11, 8], [11, 8], [6, 8],
    [11, 8], [12, 2],
  [13, 8], [12, 8], [11, 8], [13, 8], [12, [4, 8]], [13, 8], [15, [8, 16]], [15,
      16], [13, 8], [12, 8],
    //[11, 2]
  bvz([11, 2], { "oum": ["fermata"] }),
];

  m.tone = 9;
  m.base = 57;
  m.min = 2;
  m.dem = 4;
  m.name = "没有共产党就没有新中国";
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  Canon in D
  m = [
  mark("rest", 4), barl(0),
  // bar 5-10
  [16, 2], [14, 2], [12, 2], [11, 2], [9, 2], [7, 2], [9, 2], [11, 2], [12, 2], [
      11, 2], [9, 2], [7, 2],
  // bar 11-13
  [5, 2], [4, 2], [5, 2], [2, 2],
  // bar 13
  [0, 4], bvz([4, 4]), [7, 4], bvz([5, 4]), [4, 4], bvz([0, 4]), [4, 4],
    bvz([2, 4]),
  [0, 4], bvz([-3, 4]), [0, 4], bvz([7, 4]), [5, 4], bvz([9, 4]), [7, 4],
    bvz([5, 4]),
  [4, 4], bvz([0, 4]), [2, 4], bvz([11, 4]), [12, 4], bvz([16, 4]), [19,
      4], bvz([7, 4]),
  [9, 4], bvz([5, 4]), [7, 4], bvz([4, 4]),
  // bar 20
  [0, 4], [12, 4], [12, [4, 8]], [11, 8],
  // bar 21
  [12, 8], [11, 8], [12, 8], [0, 8], [-1, 8], [7, 8], [2, 8], [4, 8],
];

  m.tone = 2;
  m.base = 62;
  m.min = 4;
  m.dem = 4;
  m.name = "Canon in D";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  Canon in D
  m = [
  1, 2, 3, 5, 6, 11, [null, 2]
];

  m.base = 60;
  m.min = 4;
  m.dem = 4;
  m.name = "Canon in D";
  MelodyDict.push(m);


  ////////////////////////////////////////////////////////////
  //  We wish you merry christmas
  m = [
  -5, 1, [1, 8], [2, 8], [1, 8], [-7, 8], -6, -6,
  -6, 2, [2, 8], [3, 8], [2, 8], [1, 8], -7, -5,
  -5, 3, [3, 8], [4, 8], [3, 8], [2, 8], 1, -7, -6,
  -5, -5, -6, 2, -7, 1
];

  m.base = 67;
  m.tone = 7;
  m.min = 3;
  m.dem = 4;
  m.pickup = 2;
  m.name = "We wish you merry christmas";
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  小鸭子
  m = [
    4, 7, 7, 7, 9, 7, 4, 2, 0, [7, 2], [null, 4],
    4, 7, 7, 7, 9, 7, 4, 2, 0, [2, 2], [null, 4],
    4, 7, 7, 7, 9, 7, 9, 7, 4, [2, 2], [null, 4],
    0, 4, 7, 7, 9, 7, 4, 7, 2, [0, 2], [null, 4],
    [9, 2], 7, [9, 2], 7, [9, 2], 7, [9, 2], 7,
    0, 4, 7, 7, 9, 7, 4, 2, 0, [0, 2], [null, 4],
];

  m.base = 60;
  m.min = 3;
  m.dem = 4;
  m.name = "小鸭子";
  m.abs = true;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  欢乐颂
  m = [
    3, 3, 4, 5, 5, 4, 3, 2, 1, 1, 2, 3, [3, [4, 8]], bvz([2, 8]), [2, 2],
    3, 3, 4, 5, 5, 4, 3, 2, 1, 1, 2, 3, [2, [4, 8]], bvz([1, 8]), [1, 2], barl(3),
    2, 2, 3, 1, 2, [3, 8], [4, 8], 3, 1, 2, [3, 8], [4, 8], 3, 2, 1, 2, [-5, 2],
    3, 3, 4, 5, 5, 4, 3, 2, 1, 1, 2, 3, [2, [4, 8]], bvz([1, 8]), [1, 2], barl(4)

];

  m.base = 60;
  m.min = 4;
  m.dem = 4;
  m.name = "欢乐颂";
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  云宫迅音
  m = [
    [6, 8], [6, 8], [3, 8], [6, 8], [11, 8], [6, 8], [3, 8], [5, 8],
    [6, 8], [6, 8], [3, 8], [6, 8], [11, 8], [6, 8], [3, 8], [5, 8],
    [6, 8], [6, 8], [3, 8], [6, 8], [11, 8], [6, 8], [3, 8], [5, 8],
    [6, 8], [6, 8], [3, 8], [6, 8], [11, 8], [6, 8], [3, 8], [5, 8],

    [6, 8], [6, 8], [4, 8], [6, 8], [11, 8], [6, 8], [4, 8], [5, 8],
    [6, 8], [6, 8], [4, 8], [6, 8], [11, 8], [6, 8], [4, 8], [5, 8],
    [6, 8], [6, 8], [4, 8], [6, 8], [11, 8], [6, 8], [4, 8], [5, 8],
    [6, 8], [6, 8], [4, 8], [6, 8], [11, 8], [6, 8], [4, 8], [5, 8],

    6, 3, [null, 8], [3, 8], [6, 8], [11, 8],
    6, 3, [null, 8], [3, 8], [6, 8], [11, 8],
    6, 3, [null, 8], [3, 8], [6, 8], [11, 8],
    12, 6, [null, 8], [4, 8], [6, 8], [11, 8],

    12, 6, 11, 12, 14, 11, 12, 14, [13, 1],
    [3, 2], [6, [4, 8]], [7, 8], 11, 6, [14, [4, 8]], [12, 8], [13, [1, 1]], //
    [3, 2], [6, [4, 8]], [7, 8], 11, 6, [14, [4, 8]], [13, 8], [12, [1, 1]],
    0, 13, [12, [4, 8]], [11, 8], [13, 1], 0, 12, [11, [4, 8]], [7, 8], [12, 1],
    0, 14, 13, 12, [15, [2, 4]], 14, [13, [2, 4]], 12, [13, 1],
    [3, 2], [6, [4, 8]], [7, 8], 11, 6, [14, [4, 8]], [12, 8], [13, [1, 1]],
    [3, 2], [6, [4, 8]], [7, 8], 11, 6, [14, [4, 8]], [13, 8], [12, [1, 1]],
    13, [13, 16], [13, 16], [13, 8], [null, 8], [13, 8], [13, 8], [13, 8], 13, 0
];

  m.base = 61;
  m.tone = 1;
  m.min = 4;
  m.dem = 4;
  m.name = "云宫迅音";
  MelodyDict.push(m);


  ////////////////////////////////////////////////////////////
  //  友谊地久天长
  m = [
    16, [15, [4, 8]], [13, 8], 13, 11, [12, [4, 8]], [11, 8], 12, 13,
    [11, [4, 8]], [6, 8], 6, 5, barl(3), [11, [2, 4]], 5,

    [11, [4, 8]], [11, 8], 11, 13,
    [12, [4, 8]], [11, 8], 12, 13,
    [11, [4, 8]], [11, 8], 13, 15,
    [16, [2, 4]], 16,

    [15, [4, 8]], [13, 8], 13, 11,
    [12, [4, 8]], [11, 8], 12, 13,
    [11, [4, 8]], [6, 8], 6, 5,
    [11, [2, 4]], 16,

    [15, [4, 8]], [13, 8], 13, 11,
    [12, [4, 8]], [11, 8], 12, 16,
    [15, [4, 8]], [13, 8], 13, 15,
    [16, [2, 4]], 16,

    [15, [4, 8]], [13, 8], 13, 11,
    [12, [4, 8]], [11, 8], 12, 13,
    [11, [4, 8]], [6, 8], 6, 5, barl(4), [11, 1]
];

  m.base = 48;
  m.tone = 0;
  m.min = 4;
  m.dem = 4;
  m.name = "友谊地久天长";
  m.pickup = 3;
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  军港之夜
  m = [
    [-5, 8], [3, 8], [3, 8], [1, 8], [2, 16], [3, 16], 2, [3, 8],
    3, [-6, 8], [-5, 8], [2, 16], [1, [4, 8, 16]],
    [3, 8], [5, 8], [5, 8], [3, 8], [6, 8], 5, [3, 8],
    3, [3, 16], [2, 16], [1, 8], [3, 16], [2, [4, 8, 16]],
    3, [-7, 8], [-5, 8], [-6, 16], [-7, 16], -6, [1, 8],
    [-7, 8], [3, 8], [3, 8], [-7, 8], [-6, 16], [-7, 16], [-6, [4, 8]],
    [-7, 8], [3, 8], [3, 8], [-7, 8], [-7, 8], [-6, 16], [-7, 16], -6,
    [2, 8], [-6, 16], [1, 16], [-7, 8], [-6, 8], [-6, 16], [-5, [4, 8, 16]],
    [3, 8], [5, 8], [5, 8], [3, 8], [6, 8], [5, 16], [6, 16], 5,
    [3, 16], [5, 8], [3, 16], [1, 8], [3, 8], [3, 8], [5, [4, 8]],
    [3, 8], [5, 8], [5, 8], [3, 8], [3, 8], [2, 16], [3, 16], 2,
    [-7, 8], [-6, 16], [-7, 16], [-6, 8], [-5, 8], [3, 2],
    [3, 8], [5, 8], [5, 8], [3, 8], [6, 8], [5, 16], [6, 16], 5,
    [3, 16], [5, 8], [3, 16], [1, 8], [3, 8], [3, 8], [5, [4, 8]],
    [3, 8], [5, 8], [5, 8], [3, 8], [3, 8], [2, 16], [3, 16], 2,
    [-7, 8], [-6, 16], [-7, 16], [-6, 8], [-5, 8], [1, 2], barl(4),
    [3, 8], [5, 8], [5, 8], [3, 8], [3, 8], [2, 16], [3, 16], 2,
    -7, [-6, 8], [-5, 8], [1, 1]
];

  m.base = 60;
  m.tone = 0;
  m.min = 2;
  m.dem = 4;
  m.name = "军港之夜";
  MelodyDict.push(m);

  ////////////////////////////////////////////////////////////
  //  军港之夜
  m = [
    1, 2, 5, 2, 1, 2, 5, 2, barl(3),
    [-5, 8], [3, 8], [3, 8], [-5, 8], [-5, 8], [2, 8], 2, //bar 3
    [1, 8], [1, 8], [1, 8], [2, 8], [3, 8], [-5, 8], -5,
    [-6, 8], [1, 8], [1, 8], [-6, 8], [-5, 8], [3, 8], 3,
    [2, 8], [1, 8], [1, 8], [-6, 8], 2, 0, // bar 6
    [-5, 8], [3, 8], [3, 8], [-5, 8], [-5, 8], [2, 8], 2,
    [1, 8], [1, 8], [1, 8], [-6, 8], [-5, 8], [3, 8], 3,
    [-6, 8], [4, 8], [4, 8], [-6, 8], [-5, 8], [3, 8], 3, // bar 9
    [2, 8], [1, 8], [1, 8], [-6, 8], 1, [0, 8], [-5, 8], // 3,
    [5, 8], [-5, 16], [-5, 16], [5, 8], [-5, 8], 2, [0, 8], [1, 8],
    [-6, 8], [1, 16], [1, 16], [1, 8], [3, 8], 5, [0, 8], [1, 8], // bar 12
    [-6, 8], [1, 16], [1, 16], [1, 8], [6, 8], [5, 8], [3, 8], [3, 8], [1,
    8], // bar 13
    [-6, 8], [3, 8], [3, 8], [3, 8], 2, [0, 8], [-5, 8],
    [5, 8], [-5, 16], [-5, 16], [5, 8], [-5, 8], 2, [0, 8], [1, 8],
    [-6, 8], [1, 8], [1, 8], [5, 16], [6, 16], [5, 2], // bar 16
    [1, 8], [1, 8], [1, 8], [5, 32], [6, [16, 32]], [5, 8], [3, 8], [3, 8], [1,
    8],

    [-6, 8], [2, 16], [3, 16], [2, 8], [1, 8], 1, [2, 8], [3, [16, 32]], [4, 32],
    [5, 2], [0, 8], [7, 16], [11, 16], [12, l3], [11, l3], [7, l3], // bar 19
    [11, 2], [0, 8], [7, 16], [11, 16], [7, l3], [5, l3], [3, l3],
    [6, 2], [0, 8], [5, 16], [6, 16], [11, 16], [12, 8], [12, 16],
    [13, 8], [13, 8], [13, 8], [12, 16], [11, 16], [11, 2], // bar 22
    barl(4),

    [-6, 8], [2, 16], [3, 16], [2, 8], [1, 8], [1, 2],
];

  m.base = 60;
  m.tone = 0;
  m.min = 4;
  m.dem = 4;
  m.name = "你笑起来真好看";
  MelodyDict.push(m);

})();
