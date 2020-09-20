/********************************
 * @const
 *******************************/
var MConst = {
  ChordsInfo: [
      [145, 'C', '大三和弦', ['C']],
      [137, 'Cm', '小三和弦', ['Cm']],
      [81, 'C-5', '大三减五和弦', ['C-5']],
      [273, 'C+5', '增和弦', ['C+5', 'C+', 'Cang']],
      [585, 'Cdim', '减和弦', ['Cdim', 'C-', 'C°']],
      [161, 'Csus4', '挂四和弦', ['Csus4', 'Csus']],
      [657, 'C6', '大六和弦', ['C6']],
      [649, 'Cm6', '小六和弦', ['Cm6']],
      [1169, 'C7', '七和弦', ['C7']],
      [2193, 'Cmaj7', '大七和弦', ['Cmaj7', 'CM7']],
      [1161, 'Cm7', '小七和弦', ['Cm7']],
      [2185, 'Cm#7', '小升七和弦', ['Cm#7']],
      [1297, 'C7+5', '七增五和弦', ['C7+5', 'C7#5']],
      [1105, 'C7-5', '七减五和弦', ['C7-5', 'C7b5']],
      [1097, 'Cm7-5', '小七减五和弦', ['Cm7-5', 'Cm7b5']],
      [1201, 'C7sus4', '七挂四和弦', ['C7sus4']],
      [1681, 'C7/6', '七六和弦', ['C7/6']],
      [2197, 'Cm79', '大七九和弦', ['Cm79']],
      [1173, 'C9', '九和弦', ['C9']],
      [1301, 'C9+5', '九增五和弦', ['C9+5']],
      [1109, 'C9-5', '九减五和弦', ['C9-5']],
      [1165, 'Cm9', '小九和弦', ['Cm9']],
      [1177, 'C7+9', '七增九和弦', ['C7+9']],
      [2189, 'Cm9#7', '小九增七和弦', ['Cm9#7']],
      [1171, 'C7b9', '七减九和弦', ['C7b9']],
      [1299, 'C7-9+5', '七减九增五和弦', ['C7-9+5']],
      [1107, 'C7-9-5', '七减九减五和弦', ['C7-9-5']],
      [661, 'C69', '六九和弦', ['C69']],
      [653, 'Cm69', '小六九和弦', ['Cm69']],
      [1205, 'C11', '十一和弦', ['C11']],
      [1197, 'Cm11', '小十一和弦', ['Cm11']],
      [1237, 'C11+', '九增十一和弦', ['C11+']],
      [1717, 'C13', '十三和弦', ['C13']],
      [1715, 'C13-9', '十三减九和弦', ['C13-9']],
      [1651, 'C13-9-5', '十三减九五和弦', ['C13-9-5']],
  ],

  DegreeList: [
      [0, '纯一度'],
      [1, '小二度'],
      [2, '大二度'],
      [3, '小三度'],
      [4, '大三度'],
      [5, '纯四度'],
      [6, '增四度'],
      [7, '纯五度'],
      [8, '小六度'],
      [9, '大六度'],
      [10, '小七度'],
      [11, '大七度'],
      [12, '纯八度'],
  ],

/// length: 12
  ToneList: ["C","#C","D","#D","E","F","#F","G","#G","A","#A","B"],
/// 2741 = 0b101010110101
  MajorKey: 2741,
/// 1453 = 0b010110101101
  MinorKey: 1453,

//  1、Ionian Mode（伊奥利亚——自然大调音阶）：1、2、3、4、5、6、7 。
//      101010110101	=2741
//  2、Dorian Mode（多利亚调式——自然大调2级音阶）：1、2、b3、4、5、6、b7。
//      011010101101 	=1709
//  3、Phrygian Mode（弗利几亚调式——自然大调3级音阶）：1、b2、b3、4、5、b6、b7。
//      010110101011 	=1451
//  4、Lydian Mode（利底亚调式——自然大调4级音阶）：1、2、3、#4、5、6、7。
//      101011010101 	=2773
//  5、Mixolydian Mode（混合利底亚调式——自然大调5级音阶）：1、2、3、4、5、6、b7。
//      011010110101 	=1717
//  6、Aeolian Mode（爱奥尼亚调式———自然小调式）：1、2、b3、4、5、b6、b7 。
//      010110101101 	=1453
//  7、Locrian Mode（洛克利亚调式——自然大调7级音阶）：1、b2、b3、4、b5、b6、b7。
//      010101101011 	=1387
  MajorToneKeys: [2741, 1387, 2774, 1453, 2906, 1717, 3434, 2773, 1451, 2902, 1709, 3418],
}
exports['MConst'] = MConst;
