/********************************
 *
 * ESpace
 *
 * @constructor
 *******************************/
function ESpace(ax, ay, w, h) {
  var rect = new GRect(w, h);
  rect.setAnchor(ax, ay);
  return rect;
}
