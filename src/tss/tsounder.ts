/********************************
 * TSounder
 *
 * @constructor
 ********************************/

class TSounder {
  _noteOn_f: (chn: number, note: number, vec: number, delay: number) => void
  _noteOff_f: (chn: number, note: number, delay: number) => void
  _volume_f: (chn: number, vol: number) => void
  _instrument_f: (chn: number, ins: number, param: number) => void
  _stop_f: () => void

  constructor() {
    this._noteOn_f = null;
    this._noteOff_f = null;
    this._volume_f = null;
    this._instrument_f = null;
    this._stop_f = null;
  }

  adapt(adapter: object) {
    this._noteOn_f = adapter['noteOn'];
    this._noteOff_f = adapter['noteOff'];
    this._volume_f = adapter['setVolume'];
    this._instrument_f = adapter['programChange'];
    this._stop_f = adapter['stopAllNotes'];
  }

  noteOn(chn: number, note: number, vec: number, delay: number): void {
    if (this._noteOn_f) {
      this._noteOn_f(chn, note, vec, delay);
    }
  }

  noteOff(chn: number, note: number, vec: number, delay: number): void {
    if (this._noteOff_f) {
      this._noteOff_f(chn, note, delay);
    }
  }

  volume(chn: number, vol: number): void {
    if (this._volume_f) {
      this._volume_f(chn, vol);
    }
  }

  instrument(chn: number, ins: number, param: number): void {
    if (this._instrument_f) {
      this._instrument_f(chn, ins, param);
    }
  }

  stop(): void {
    if (this._stop_f) {
      this._stop_f();
    }
  }
}
