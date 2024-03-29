/*************************************************************************
    > File Name: imagesave.js
    > Author: cosim
    > Mail: cosimzhou@hotmail.com
    > Created Time: 四  2/20 23:24:39 2020
 ************************************************************************/

function Img(url) {
  this.queue = [];
  this.img = new Image();
  var me = this;
  this.onloads = [];
  this.img.onload = function() {
    var queue = me.queue;
    me.queue = null;
    for (var a of queue) {
      me.draw(...a);
    }

    if (me.onload) {
      me.onload();
    }
    var arr = me.onloads;
    me.onloads = null;
    for (var f of arr) {
      f();
    }
  }
  this.img.src = url;
}

Img.prototype.draw = function(ctx, x, y, w = null, h = null) {
  if (this.queue != null) {
    this.queue.push([ctx, x, y, w, h]);
  } else {
    ctx.drawImage(this.img, x, y, w || this.img.width, h || this.img.height);
  }
}
Img.prototype.pushOnload = function(f) {
  if (this.onloads instanceof Array)
    this.onloads.push(f);
}

//var Mozaik = new Img("data:image/jpeg;base64,...");
//var Mozaik = new Img("data:image/svg+xml;base64,...");

var Mozaik = new Img("paper.jpg");


var savePages = new Set();
var pictype = "png";

function ldownload() {
  download(pictype);
}

function download(type = 'png') {
  if (!savePages.has(gct.pageIndex())) {
    downloadImage(filelist[fileIndex] + "-" + (gct.pageIndex() + 1),
      Container,
      type);
    savePages.add(gct.pageIndex());
  }
}

function downloadImage(filename, container, type = 'png') {
  //设置保存图片的类型
  var imgdata;
  if (type != 'svg') {
    imgdata = container.toDataURL(type);
  } else {
    imgdata = "data:image/octe-stream;base64," + btoa(unescape(
      encodeURIComponent(container.outerHTML)));
  }

  //将mime-type改为image/octet-stream,强制让浏览器下载
  var fixtype = function(type) {
    type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
    var r = type.match(/png|jpeg|bmp|gif|svg/)[0];
    return 'image/' + r;
  }
  imgdata = imgdata.replace(fixtype(type), 'image/octet-stream')
  //将图片保存到本地
  var saveFile = function(data, filename) {
    var link = document.createElement('a');
    link.href = data;
    link.download = filename;
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false,
      false, false, false, 0, null);
    link.dispatchEvent(event);
  }
  var filename = 'score-' + filename + '-' + (new Date().getTime()) + '.' +
    type;
  saveFile(imgdata, filename);
}


function getParam(name, def = null) {
  var paramVal = def;
  if (location.search.length > 1) {
    var params = location.search.substr(1).split("&");
    for (var p of params) {
      var pos = p.indexOf("=");
      if (pos < 0) continue;

      var pname = p.substr(0, pos),
        value = p.substr(pos + 1);
      if (pname == name) {
        paramVal = parseInt(value);
      }
    }
  }
  return paramVal;
}


function makeCatalog(array, func) {
  var url = location.origin + location.pathname;
  var div = document.getElementById("catalog");
  for (var i in array) {
    var a = document.createElement("a");
    a.innerHTML = i + ". " + (func ? func(array[i]) : array[i]);
    a.href = url + "?mi=" + i;
    div.appendChild(a);
    div.appendChild(document.createElement("br"));
  }
}

var gct, ctx;
var player;

function showPage() {
  for (var elem of document.querySelectorAll(".pageNum")) {
    elem.innerText = (gct.pageIndex() + 1) + "/" + gct.pageCount();
  }
}

function redraw() {
  gct.clear();
  gct.print(gct.pageIndex());

  showPage();
}

function playRedraw() {
  if (!gct.frameNext()) {
    return;
  }

  if (!gct.isPlaying()) {
    if (playIntervalHandle)
      clearInterval(playIntervalHandle);
    playIntervalHandle = null;
  }

  gct.clear();
  gct.print();

  showPage();
}

function firstPage() {
  if (gct.pageIndex() > 0) {
    gct.pageIndex(0);
    redraw();
  }
}

function prevPage() {
  if (gct.pageIndex() > 0) {
    gct.pageIndex(gct.pageIndex() - 1);
    redraw();
  }
}

function nextPage() {
  if (gct.pageIndex() < gct.pageCount() - 1) {
    gct.pageIndex(gct.pageIndex() + 1);
    redraw();
  }
}

function lastPage() {
  if (gct.pageIndex() < gct.pageCount() - 1) {
    gct.pageIndex(gct.pageCount() - 1);
    redraw();
  }
}

var playIntervalHandle;

function Stop() {
  player.stop();
  for (var elem of document.querySelectorAll(".play_pause")) {
    elem.innerText = "播放";
  }
  gct.cursor = 0;
  redraw();
  clearInterval(playIntervalHandle);
  playIntervalHandle = null;
  gct.cursor = 0;
}

function Play() {
  player.resume();
  var hintText;
  if (player.playing()) {
    if (playIntervalHandle)
      clearInterval(playIntervalHandle);

    if (gct.cursor == 0) {
      gct.cursor = 1;
      playRedraw();
    }
    playIntervalHandle = setInterval(playRedraw, 60000 / 120 / 32);
    hintText = "暂停";
  } else {
    hintText = "播放";
    clearInterval(playIntervalHandle);
    playIntervalHandle = null;
  }

  for (var elem of document.querySelectorAll(".play_pause")) {
    elem.innerText = hintText;
  }
}

function addButtonBar(content) {
  var array = [];
  var a = document.createElement("a");
  a.href = "#";
  a.innerHTML = "首页";
  a.onclick = firstPage;
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.innerHTML = "上一页";
  a.onclick = prevPage;
  array.push(a);

  a = document.createElement("span");
  a.className = "pageNum";
  a.innerHTML = "0 / 0";
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.innerHTML = "下一页";
  a.onclick = nextPage;
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.innerHTML = "尾页";
  a.onclick = lastPage;
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.innerHTML = "下载";
  a.onclick = ldownload;
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.className = "prev_song";
  a.innerHTML = "上一首";
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.onclick = Play;
  a.innerHTML = "播放";
  a.className = "play_pause";
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.onclick = Stop;
  a.innerHTML = "停止";
  array.push(a);

  a = document.createElement("a");
  a.href = "#";
  a.className = "next_song";
  a.innerHTML = "下一首";
  array.push(a);


  for (var a of array) {
    content.appendChild(a);
    content.appendChild(a = document.createElement("span"));
    a.innerHTML = " ";
  }
}

function addScorePanel(w, h, isSvg = false) {
  var content = document.getElementById("content");
  var title = document.createElement("div");
  title.id = "title";
  content.appendChild(title);
  content.appendChild(document.createElement("br"));

  addButtonBar(content);
  content.appendChild(document.createElement("br"));

  if (isSvg) {
    var div = document.createElement("div");
    content.appendChild(div);

    var xhr = new XMLHttpRequest;
    xhr.open('get', '../svg/template.svg', false);
    xhr.send();

    if (xhr.readyState === 4 && xhr.status === 200) {
      var svg = xhr.responseXML.documentElement;
      svg = document.importNode(svg, true);

      // surprisingly optional in these browsers
      div.appendChild(svg);

      ctx = svg;

      svg.id = "myCanvas";
      svg.width.baseVal.valueAsString = "800";
      svg.height.baseVal.valueAsString = "800";
    }

    pictype = "svg";
  } else {
    pictype = "png";

    var canvas = document.createElement("canvas");
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.id = "myCanvas";
    canvas.style.width = w;
    canvas.style.height = h;
    content.appendChild(canvas);
  }

  content.appendChild(document.createElement("br"));
  addButtonBar(content);
}

window.addEventListener("load", function() {
  var mi = getParam("mi");
  var nmi = mi + 1;
  for (var elem of document.querySelectorAll(".next_song")) {
    if (nmi > 39) elem.style.display = 'none';
    elem.href = location.pathname + "?mi=" + nmi;
  }

  nmi = mi - 1;
  for (var elem of document.querySelectorAll(".prev_song")) {
    if (nmi < 0) elem.style.display = 'none';
    elem.href = location.pathname + "?mi=" + nmi;
  }

});


var drawBackgrond = false;
