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

var gEID = {
  "g-clef": ESpace(0, 32, 20, 52),
  "f-clef": ESpace(0, 7, 21.6, 24),
  "c-clef": ESpace(0, 15.25, 21.7, 31.5),
  "sharp": ESpace(0, 8, 5.6, 15.2),
  "flat": ESpace(0, 8, 6, 13),
  "rest-4": ESpace(0, 13, 8, 24),
  "rest-8": ESpace(0, 8, 10, 18),
  "rest-16": ESpace(0, 8, 10, 18),
  "rest-32": ESpace(0, 8, 10, 18),
  "rest-64": ESpace(0, 8, 10, 18),
  "rest-128": ESpace(0, 8, 10, 18),
  "natural": ESpace(0, 8, 4, 15.2),
  "note": ESpace(0, 5, 11, 9.9),
  "note2": ESpace(0, 5, 11, 9.9),
  "fullnote": ESpace(0, 4, 12.6, 8.1),
  "brace": ESpace(0, 0, 8, 82),
  "num": ESpace(0, 0, 8, 82),
  "fermata": ESpace(0, 8, 6, 13),
};

(function() {
  gEID.get = function(x) {
    return gEID[x];
  }
  for (var k in gEID) {
    gEID[k].name = k;
  }
})();

/********************************
 *
 *
 *******************************/
function EOption() {
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


}

exports.EOption = EOption;
var g_option = new EOption();

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
