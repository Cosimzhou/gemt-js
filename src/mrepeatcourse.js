/********************************
 * MRepeatSegment
 *
 *
 *******************************/
function MRepeatSegment(start, end, repeat = true) {
  this._start = start;
  this._end = end;
  this._repeat = repeat;
  this._realStart = start;
  this._segment = [];
}

MRepeatSegment.prototype._length = function() {
  return this._end - this._start;
}
MRepeatSegment.prototype._absorb = function(elem) {
  this._segment.push(elem);
}
MRepeatSegment.prototype._expand = function() {
  if (this._repeat) {
    var beatNum = this._length();
    for (var len = this._segment.length, i = 0; i < len; ++i) {
      var elem = this._segment[i].clone();
      elem._shift(beatNum);
      this._segment.push(elem);
    }
    this._repeat = false;
    this._end += beatNum;
  }

  if (this._start < this._realStart) {
    var offset = this._realStart - this._start;
    for (var i = 0, elem; elem = this._segment[i]; ++i) {
      elem._shift(offset);
    }
    this._start += offset;
    this._end += offset;
  }
}

/********************************
 * MRepeatCourse
 *
 *
 *******************************/
function MRepeatCourse() {
  this._array = [];
  this._segments = [];
}

MRepeatCourse.Const = {
  Begin: 1,
  End: 2,
};

MRepeatCourse.prototype._push = function(beat, type) {
  this._array.push([beat, type]);
}

MRepeatCourse.prototype._archive = function(unit) {
  this._segments = [];

  if (this._array.length == 0) {
    return;
  }

  // Fill the repeated segment from the begin and end repeat bar line.
  for (var i = 0, beginBeat = 0; i < this._array.length; ++i) {
    elem = this._array[i];
    if (elem[1] == MRepeatCourse.Const.Begin) {
      beginBeat = elem[0] * unit;
    } else if (elem[1] == MRepeatCourse.Const.End) {
      this._segments.push(new MRepeatSegment(beginBeat, elem[0] * unit));
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
    beat += seg._length();
    if (seg._repeat) {
      beat += seg._length();
    }
  }
}

MRepeatCourse.prototype._expand = function(array, beat) {
  this._archive(beat || 1);
  if (this._segments.length == 0) {
    return;
  }


  for (var i = 0, j = 0, seg; seg = this._segments[i]; ++i) {
    for (var elem; elem = array[j]; j++) {
      //if elem in seg.
      if (seg._end > elem._seqVal()) {
        seg._absorb(elem);
      } else {
        break;
      }
    }
  }

  array.splice(0);
  for (var i = 0, seg; seg = this._segments[i]; ++i) {
    seg._expand();
    array.push(...seg._segment);
  }

  console.log(this);
}
