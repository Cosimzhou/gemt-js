/*********************************
 *
 * MMark
 * @constructor
 *
 *******************************/

class MMark extends MLayerBase {
  subtype: number
  kind: string

  lf: boolean
  param: any
  constructor(kind: string, type: number = 0, param: any = null) {
    super();
    this.kind = kind;
    this.subtype = type;
    this.param = param;
  }

  _convertToE(clef?: MClef): ELayoutBudget {
    var newobj;
    switch (this.kind) {
      case 'barline':
        newobj = new EBarline(this.subtype);
        newobj._lineFresh = this.lf;
        break;
      case 'rest':
        newobj = new ERest(-this.subtype);
        break;
      case 'dupbar':
      case 'blank':
        break;
      case 'parenleft':
      case 'parenright':
        newobj = new EMark(this.kind, 2);
        break;
      default:
        newobj = new EMark(this.kind, -1.5);
        break;
    }

    if (this.param) {
      for (let p in this.param)
      newobj[p] = this.param[p];
    }
    return newobj;
  }
}
