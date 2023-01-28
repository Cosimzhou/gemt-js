/*********************************
 *
 * MMark
 * @constructor
 *
 *******************************/

class MMark extends MLayerBase {
  type: number
  kind: string

  lf: boolean
  constructor(kind: string, type: number = 0) {
    super();
    this.kind = kind;
    this.type = type;
  }

  _convertToE(clef?: MClef): ELayoutBudget {
    var newobj;
    switch (this.kind) {
      case 'barline':
        newobj = new EBarline(this.type);
        newobj._lineFresh = this.lf;
        break;
      case 'rest':
        newobj = new ERest(-this.type);
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
    return newobj;
  }
}
