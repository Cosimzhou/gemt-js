/********************************
 *
 * MBeat
 * @constructor
 *
 *******************************/
function MBeat(n = 2, d = 4){
  this.numerator = n;
  this.denominator = d;
}
exports['MBeat'] = MBeat;
MBeat.prototype.set = function(n){
  this.numerator = n['numerator'];
  this.denominator = n['denominator'];
}
MBeat.prototype.equal = function(tb) {
  return this.numerator == tb.numerator && this.denominator == tb.denominator;
}
MBeat.prototype.length = function(n = 4){
  return this.numerator * n / this.denominator;
}
MBeat.prototype.nth = function(n) {
  var beat = n.beat;
  return 4/beat;
}
MBeat.prototype.beat = function(n){
  if (n == this.denominator) {
  }
}
MBeat.prototype.note = function(n){
  if (n == this.denominator) {
  }
}
MBeat.prototype.nths = function(beat, limit=null){
  var primes = [1,3,5,6,7,9,11,13,15,17,19,21,23];
  var ns, origin_beat = beat;
  for (var pi = 0, seq; seq = primes[pi]; pi++) {
    ns = [];
    beat = origin_beat*seq;
    for (var n = 1, i = this.denominator; n < 128; i /= 2, n <<= 1) {
      while (beat >= i) {
        ns.push(n)
        beat -= i;
      }
    }
    if (beat == 0) {
      ns.seq = seq;
      break;
    } else {
      ns = [4];
    }
    if (pi >=limit) break;
  }
  return ns;
}
MBeat.prototype.convertMark = function(){
  return new EBeatMark(this.numerator, this.denominator);
}

