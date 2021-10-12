function EPositionInfo() {
  this.rect = new GRect(...arguments);
  this.rects = [];
  this.operations = [];
  this.width = this.rect.width || 0;
  //this.shx = {};
  //this.img = {};
  //this.noMargin = false;
}

EPositionInfo.prototype.addOperation = function(op) {
  this.operations.push(op);
  return this;
}

EPositionInfo.prototype.pushOperations = function() {
  this.operations.push(...arguments);
  return this;
}

EPositionInfo.prototype.length = function() {
  return this.operations.length;
}
