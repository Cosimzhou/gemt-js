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

//var Mozaik = new Img("data:image/jpeg;base64,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");
var Mozaik = new Img("paper.jpg");

function downloadImage(filename, container, type = 'png') {
  //设置保存图片的类型
  var imgdata = container.toDataURL(type);
  //将mime-type改为image/octet-stream,强制让浏览器下载
  var fixtype = function(type) {
    type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
    var r = type.match(/png|jpeg|bmp|gif/)[0];
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
  } else {
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
