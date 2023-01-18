/********************************
 * MRepeatSegment
 *
 *
 *******************************/
class MRepeatSegment {
  _start: number
  _end: number
  _repeat: boolean
  _realStart: number
  _segment: Array<GTimeSlice>
  constructor(start: number, end: number, repeat: boolean = true) {
    this._start = start;
    this._end = end;
    this._repeat = repeat;
    this._realStart = start;
    this._segment = [];
  }

  get length(): number {
    return this._end - this._start;
  }
  _absorb(elem): void {
    this._segment.push(elem);
  }
  _expand(): void {
    if (this._repeat) {
      let beatNum = this.length;
      for (let len = this._segment.length, i = 0; i < len; ++i) {
        let elem = this._segment[i].clone();
        elem._shift(beatNum);
        this._segment.push(elem);
      }
      this._repeat = false;
      this._end += beatNum;
    }

    if (this._start < this._realStart) {
      let offset = this._realStart - this._start;
      for (let i = 0, elem; elem = this._segment[i]; ++i) {
        elem._shift(offset);
      }
      this._start += offset;
      this._end += offset;
    }
  }
}

class MRepeatTiming {
  beat: number
  kind: number
  constructor(b: number, k: number) {
    this.beat = b;
    this.kind = k;
  }
}

/********************************
 * MRepeatCourse
 *
 *
 *******************************/
class MRepeatCourse {
  _timings: Array<MRepeatTiming>
  _segments: Array<MRepeatSegment>
  constructor() {
    this._timings = [];
    this._segments = [];
  }

  static Const = {
    Begin: 1,
    End: 2,
  };

  _push(beat: number, type: number) {
    this._timings.push(new MRepeatTiming(beat, type));
  }

  _archive(unit: number) {
    this._segments = [];

    if (this._timings.length == 0) {
      return;
    }

    // Fill the repeated segment from the begin and end repeat bar line.
    for (let i = 0, beginBeat = 0; i < this._timings.length; ++i) {
      let elem = this._timings[i];
      if (elem.kind == MRepeatCourse.Const.Begin) {
        beginBeat = elem.beat * unit;
      } else if (elem.kind == MRepeatCourse.Const.End) {
        this._segments.push(new MRepeatSegment(beginBeat, elem.beat * unit));
      }
    }

    // Fill the unrepeated segment between the two adjacent repeated segments.
    for (var i = 1; i < this._segments.length; ++i) {
      if (this._segments[i - 1]._end != this._segments[i]._start) {
        this._segments.splice(i, 0, new MRepeatSegment(this._segments[i - 1]
          ._end, this._segments[i]._start, false));
        i++;
      }
    }

    // Insert a leading unrepeated segment, if the music does not repeat from beginning
    if (this._segments[0]._start != 0) {
      this._segments.unshift(new MRepeatSegment(0, this._segments[0]._start,
        false));
    }

    // Append the trail unrepeated segment
    this._segments.push(new MRepeatSegment(this._segments[this._segments
      .length - 1]._end, Infinity, false));


    // Calculate real start beat
    for (var i = 0, seg, beat = 0; seg = this._segments[i]; ++i) {
      seg._realStart = beat;
      beat += seg.length;
      if (seg._repeat) {
        beat += seg.length;
      }
    }
  }

  _expand(array: Array<MRepeatElement>, beat?: number) {
    this._archive(beat || 1);
    if (this._segments.length == 0) {
      return;
    }


    for (let i = 0, j = 0, seg; seg = this._segments[i]; ++i) {
      for (let elem; elem = array[j]; j++) {
        //if elem in seg.
        if (seg._end > elem._seqVal()) {
          seg._absorb(elem);
        } else {
          break;
        }
      }
    }

    array.splice(0);
    for (let i = 0, seg; seg = this._segments[i]; ++i) {
      seg._expand();
      array.push(...seg._segment);
    }

    console.log(this);
  }
}
