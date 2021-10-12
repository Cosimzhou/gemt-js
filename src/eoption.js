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
var Gap = 8;

var g_GInfo = {
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
};

(function() {
  g_GInfo.get = function(x) {
    return g_GInfo[x];
  }
  for (var k in g_GInfo) {
    g_GInfo[k].name = k;
  }
})();

var g_option;
/********************************
 *
 *
 *******************************/
function EOption() {
  if (g_option == null) {
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
exports.EOption = EOption;

g_option = new EOption();

EOption.prototype.set = function(varname, value) {
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

EOption.prototype.use = function() {
  g_option = this;
  return this;
}
