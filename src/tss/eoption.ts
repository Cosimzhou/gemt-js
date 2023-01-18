/**************************************************************
 *
 *
 *  E-Layer
 *
 * Classes:
 *
 *      ETrack
 *      EScore
 *      ESkip
 *      EBlank
 *      EBarline
 *      EMark
 *      EBeatMark
 *      ERest
 *      ENote
 *      EChord
 *      EOption
 *
 *
 *************************************************************/
function ESpace(ax: number, ay: number, w: number, h: number) {
  var rect = new GRect(w, h);
  rect.setAnchor(ax, ay);
  return rect;
}

var Gap = 8;

class GUIInfo {
  static a = {
  "g-clef": ESpace(0, 32, 20, 52),
  "f-clef": ESpace(0, 7, 21.6, 24),
  "c-clef": ESpace(0, 15.25, 21.7, 31.5),
  "sharp": ESpace(0, 8, 5.6, 15.2),
  "flat": ESpace(0, 8, 6, 13),
  "natural": ESpace(0, 8, 3.62, 15.2),
  "rest-4": ESpace(0, 13, 8, 24),
  "rest-8": ESpace(0, 8, 10, 18),
  "rest-16": ESpace(0, 8, 10, 18),
  "rest-32": ESpace(0, 8, 10, 18),
  "rest-64": ESpace(0, 8, 10, 18),
  "rest-128": ESpace(0, 8, 10, 18),
  "note": ESpace(0, 3.42, 8.16, 6.84),
  "note2": ESpace(0, 3.78, 9.01, 7.56),
  "fullnote": ESpace(0.8, 4, 12.6, 8.1),
  "brace": ESpace(0, 0, 8, 82),
  "num": ESpace(0, 0, 8, 82),
  "fermata": ESpace(0, 8, 6, 13),

  "cadence": ESpace(7.25, 3.25, 14.5, 6.5),
  "triangle": ESpace(2, 8, 4, 8),
  "tsuyoi": ESpace(4, 4, 8, 8),
  "yowai": ESpace(4, 4, 8, 8),
}

  constructor() {
    var ginfo = GUIInfo.a;
    for (var k in ginfo) {
      ginfo[k].name = k;
    }
  }

  get(x: string): GRect{
    return GUIInfo.a[x];
  }
}

var g_GInfo: GUIInfo = new GUIInfo();
var g_option: EOption;

/********************************
 *
 *
 *******************************/
class EOption {
  trackWidth : number
  gap : number
  gapBetweenRows : number
  gapMinBetweenRows : number
  margin : number
  marginBlank : number
  marginAhead : number
  marginTitle : number
  indentHeading : number

  fontFamily: string

  barNoShowAtRowHeading : boolean
  /**
   *  heading indent
   *
   *  which implies indent just for first row.
   */
  _openTrack : any

  funcPageRender : (ctx: object, p: number)=>void
  funcTitleRender :(ctx: object, p: number)=>void
  funcTailRender : (ctx: object, p: number)=>void
  funcFootRender : (ctx: object, p: number)=>void
  funcHeadRender : (ctx: object, p: number)=>void
  constructor(isDef?: boolean) {
    if (isDef || g_option == null) {
      this.trackWidth = 750;
      this.gap = 8;
      this.gapBetweenRows = 30;
      this.gapMinBetweenRows = 10;
      /**
       *
       */
      this.margin = 6;
      this.marginBlank = 20;
      this.marginAhead = 7;
      this.marginTitle = 0;
      this.barNoShowAtRowHeading = true;

      this.fontFamily = "微软雅黑";
      /**
       *  heading indent
       *
       *  which implies indent just for first row.
       */
      this.indentHeading = 0;

      this.funcPageRender = null;
      this.funcTitleRender = null;
      this.funcTailRender = null;
      this.funcFootRender = null;
      this.funcHeadRender = null;
    } else {
      for (var prop in g_option) {
        this[prop] = g_option[prop];
      }
    }
  }

  //static g_option = new EOption();

  set(varname: string, value: any): EOption {
    switch (varname) {
      case "gapOfLine":
        this.gap = value;
        break;
      case "lengthOfRow":
        this.trackWidth = value;
        break;
      case "margin":
        this.margin = value;
        break;
      case "fontFamily":
        this.fontFamily = value;
        break;
      case "marginBlank":
        this.marginBlank = value;
        break;
      case "marginTitle":
        this.marginTitle = value;
        break;
      case "indentHeading":
        this.indentHeading = value;
        break;
      case "pageRender":
        this.funcPageRender = value;
        break;
      case "titleRender":
        this.funcTitleRender = value;
        break;
      case "tailRender":
        this.funcTailRender = value;
        break;
      case "footRender":
        this.funcFootRender = value;
        break;
      case "headRender":
        this.funcHeadRender = value;
        break;
      case "barNoShowAtRowHeading":
        this.barNoShowAtRowHeading = value;
        break;
      case "openTrack":
        this._openTrack = value;
        break;
    }
    return this;
  }

  use(): EOption {
    g_option = this;
    return this;
  }
}
