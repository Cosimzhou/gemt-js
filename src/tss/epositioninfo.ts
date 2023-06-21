// TODO():
class AAAA {
  anchorOp: GStroke;
  _eobj: ELayoutBudget;
}

class EPositionInfo {
  rect: GRect;
  rects: Array<GRect>;
  operations: Array<GStroke>;
  mainStroke: GStroke;
  width: number;

  // extension property
  shx: any;
  img: any;
  noMargin: boolean;

  maxYOfNote: number;
  minYOfNote: number;
  rowOriginPoint: GPoint;
  rowIndex: number;

  _end: any;
  constructor(...args: number[]) {
    this.rect = new GRect(...args);
    this.rects = [];
    this.operations = [];
    this.width = this.rect.width || 0;
    //this.shx = {};
    //this.img = {};
    //this.noMargin = false;
  }

  addOperation(op: GStroke) {
    this.operations.push(op);
    return this;
  }

  pushOperations(...args: GStroke[]): EPositionInfo {
    this.operations.push(...args);
    return this;
  }

  get length(): number {
    return this.operations.length;
  }
}
