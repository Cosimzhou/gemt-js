/*************************************************************************
    > File Name: imagesave.js
    > Author: cosim
    > Mail: cosimzhou@hotmail.com
    > Created Time: 四  2/20 23:24:39 2020
 ************************************************************************/


function downloadImage(filename, container, type = 'png') {
    //设置保存图片的类型
    var imgdata = container.toDataURL(type);
    //将mime-type改为image/octet-stream,强制让浏览器下载
    var fixtype = function (type) {
        type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
        var r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }
    imgdata = imgdata.replace(fixtype(type), 'image/octet-stream')
    //将图片保存到本地
    var saveFile = function (data, filename) {
        var link = document.createElement('a');
        link.href = data;
        link.download = filename;
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }
    var filename = 'score-' + filename + '-' + (new Date().getTime()) + '.' + type;
    saveFile(imgdata, filename);
}


function getParam(name) {
    var fileIndex = null;
    if (location.search.length > 1) {
        var params = location.search.substr(1).split("&");
        for (var p of params) {
            var pos = p.indexOf("=")
            if (pos < 0) continue;

            var pname = p.substr(0, pos),
            value = p.substr(pos+1);
            if (pname == name) {
                fileIndex = parseInt(value);
            }
        }
    }
    return fileIndex;
}


function makeCatalog(array, func) {
    var url = location.origin+location.pathname;
    var div = document.getElementById("catalog");
    for (var i in array) {
        var a = document.createElement("a");
        a.innerHTML = i + ". " + func(array[i]);
        a.href = url+"?mi="+i;
        div.appendChild(a);
        div.appendChild(document.createElement("br"));
    }
}

var gct, ctx;
var pageIdx = 0;

function download() {}

function redraw(){
    ctx.restore();
    ctx.save();
    ctx.clearRect(0,0, 800,800);
    gct.print(pageIdx);

    $(".pageNum").text((pageIdx+1)+ "/"+(gct.pageYBase.length-1));
    setTimeout(download, 500);
}

function prevPage() {
    if (pageIdx > 0) {
        pageIdx--;
        redraw();
    }
}
function nextPage() {
    if (pageIdx < gct.pageYBase.length-2) {
        pageIdx++;
        redraw();
    } else {

    }
}
