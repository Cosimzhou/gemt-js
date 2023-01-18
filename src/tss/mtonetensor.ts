/********************************
 *
 * MToneTenser
 *
 * @constructor
 *******************************/

class MToneStatisticsEntry {
  counter: number
  match: number
  array: Array<number>
  key: number
  constructor(k: number) {
    this.counter = 0;
    this.match = 9
    this.array = [];
    this.key = k;
  }
}

class MToneTenser {
  tenser: Array<MToneStatisticsEntry>
  total: number
  high: number
  low: number
  barn: number
  candidate: Set<number>
  certain: number
  _clef: any
  //counter
  constructor() {
    this.tenser = [
      new MToneStatisticsEntry(2741), //0:
      new MToneStatisticsEntry(1387), //1:
      new MToneStatisticsEntry(2774), //2:
      new MToneStatisticsEntry(1453), //3:
      new MToneStatisticsEntry(2906), //4:
      new MToneStatisticsEntry(1717), //5:
      new MToneStatisticsEntry(3434), //6:
      new MToneStatisticsEntry(2773), //7:
      new MToneStatisticsEntry(1451), //8:
      new MToneStatisticsEntry(2902), //9:
      new MToneStatisticsEntry(1709), //10,
      new MToneStatisticsEntry(3418), //11,
    ];
    this.total = 0;
    this.high = 0;
    this.low = Infinity;
  }

  absorb(e: MNote): void {
    var key = 1 << (e.pitch % 12);
    for (let t of this.tenser) {
      if (e.pitch > this.high) this.high = e.pitch;
      if (e.pitch < this.low) this.low = e.pitch;
      if (t.key & key) {
        // in tone
        if (t.match == 1) {
          t.array[t.array.length - 1]++
        } else {
          t.match = 1;
          t.array.push(1)
        }
      } else {
        // out of tone
        if (t.match == 0) {
          t.array[t.array.length - 1]++
        } else {
          t.match = 0;
          t.array.push(1)
        }
        t.counter++;
      }
    }
    this.total++;
  }

  conclude(): boolean {
    if (this.total < 15) {
      return false;
    }

    var minv = Infinity,
      candidate;
    for (let e, i = 0; e = this.tenser[i]; ++i) {
      if (e.counter < minv) {
        minv = e.counter;
        candidate = new Set([i]);
      } else if (e.counter == minv) {
        candidate.add(i);
      }
    }

    this.certain = 0;
    if (minv == 0) {
      this.certain = 100;
      if (candidate.size == 1) {
        //this.certain = 100;
      } else {
        //this.certain = 100;
      }
    } else if (minv < this.total / 10) {
      this.certain = 100 - minv / this.total;
      if (candidate.size == 1) {} else {}
    } else {
      console.error("it must be turned");
    }

    this.candidate = candidate;

    // clef   h    b   a
    // g clef 67   64  77
    // c clef 60   53  67
    // f clef 53   43  57

    var clef = [
      [64, 77, 67, 0],
      [53, 67, 60, 2],
      [43, 57, 53, 1],
    ];
    var mlen = 0;

    this._clef = 0;
    for (let c of clef) {
      let h = c[1],
        l = c[0],
        len;
      if (h > this.high) h = this.high;
      if (l < this.low) l = this.low;
      len = h - l;
      if (len > mlen) {
        mlen = len;
        this._clef = c[3];
      }
    }

    return true;
  }

  join(mtt): boolean {
    if (this.candidate == null) return false;
    if (mtt.candidate == null) {

    }

    // TODO():
    //var arr = [];
    //for (let i = 0; i < 12; i++) {
    //  arr.push([i, this.tenser[i].counter + mtt.tenser[i].counter]);
    //}
    //arr.sort(function(a, b) { return a[1] - b[1] });
    //var mon = arr.shift()

    var can = new Set<number>();
    for (let c of this.candidate) {
      if (mtt.candidate.has(c)) {
        can.add(c);
      }
    }

    if (can.size == 0) {
      return false;
    }

    for (let i = 0, t; i < 12; ++i) {
      let thv = this.tenser[i],
        mtv = mtt.tenser[i];
      let om = mtv.match;
      if (mtv.array.length % 2 == 0) {
        om = 1 - om;
      }

      if (thv.match == om) {
        thv.array[thv.array.length - 1] += mtv.array.shift();
      }
      thv.array.push(...mtv.array);
      thv.match = mtv.match;
      thv.counter += mtv.counter;
    }
    this.total += mtt.total;

    this.candidate = can;
    if (this.high < mtt.high) this.high = mtt.high;
    if (this.low > mtt.low) this.low = mtt.low;

    return true;
  }
}
