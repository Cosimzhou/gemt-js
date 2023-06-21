/********************************
 *
 * ETrack
 *      E层的轨
 * @constructor
 *
 * Args:
 *      score   EScore对象
 *
 *******************************/

class ETrackHeaderMark {
  marksIdx: number;
  headerMarks: Array<ELayoutBudget>;

  constructor(idx: number, marks: Array<ELayoutBudget>) {
    this.marksIdx = idx;
    this.headerMarks = marks;
  }
}

class ETrack {
  score: EScore;
  x: number;
  _y: number;
  gap = g_option.gap;
  marks: Array<ELayoutBudget>;
  clefMarks: Array<ETrackHeaderMark>;
  beatMarks: Array<ETrackHeaderMark>;
  constructor(sc: EScore) {
    this.score = sc;
    this.x = 0;
    this.gap = g_option.gap;
    this.marks = [];
    this.clefMarks = [];
    this.beatMarks = [];
  }

  translate(l: number): number {
    return this._y + l * this.gap;
  }

  preview(ctx: GContext, x: number, y: number): Array<GStroke> {
    var ops = [],
      line;
    x += this.x;
    this._y = y;
    for (var i = 0; i < 5; i++) {
      ops.push((line = ctx._hline(x, y, this.score.trackLength)));
      y += this.gap;
    }
    //
    // ops.baseLine = line;
    return ops;
  }

  append(mark): void {
    this.marks.push(mark);
  }
}
