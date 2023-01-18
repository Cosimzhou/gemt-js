/********************************
 *
 * MBeat
 * @constructor
 *
 *******************************/
class MBeat { //implements MInterface {
  numerator: number
  denominator: number
  constructor(n: number = 2, d: number = 4) {
    this.numerator = n;
    this.denominator = d;
  }

  set(n) {
    this.numerator = n.numerator;
    this.denominator = n.denominator;
  }

  _equal(tb: MBeat): boolean {
    return this.numerator === tb.numerator && this.denominator === tb.denominator;
  }

  _unlimited(): boolean {
    // TODO:
    return this.numerator >= 100;
  }

  length(n: number = 4): number {
    return this.numerator * n / this.denominator;
  }

  //nth(n: number): number { return 4 /  n.beat; }

  //MBeat.prototype.beat(n) {
  //  if (n == this.denominator) {}
  //}
  //
  //MBeat.prototype.note(n) {
  //  if (n == this.denominator) {}
  //}

  nths(beat, limit = null) {
    var primes = [1, 3, 5, 6, 7, 9, 11, 13, 15, 17, 19, 21, 23];
    var ns, rseq=1, origin_beat = beat;
    for (var pi = 0, seq; seq = primes[pi]; pi++) {
      ns = [];
      beat = origin_beat * seq;
      for (var n = 1, i = this.denominator; n < 128; i /= 2, n <<= 1) {
        while (beat >= i) {
          ns.push(n)
          beat -= i;
        }
      }
      if (beat == 0) {
        rseq = seq;
        break;
      } else {
        ns = [4];
      }
      if (pi >= limit) break;
    }
    return new MBeatSequence(ns, rseq);
  }

  _convertMark(): ELayoutBudget {
    return this.numerator < 100? new EBeatMark(this.numerator, this.denominator): null;
  }
}

class MBeatSequence {
  seq: number
  _nths: Array<number>
  constructor(nths: Array<number> = null, seq: number = 1) {
    this._nths = nths || [1];
    this.seq = 1;
  }

  get nth(): number { return this._nths[0]; }
  get nths(): Array<number> { return this._nths; }
  get length(): number { return this._nths.length; }

  //nth(i: number): number { return this._nths[i]; }

  shift(): MBeatSequence {
    return new MBeatSequence([this._nths.shift()], this.seq);
  }
}
