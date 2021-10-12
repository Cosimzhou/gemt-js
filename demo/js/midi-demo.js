var fileIndex, tmp_fileIndex;

var filelist = [
      //"Arabian_Dance-Tchaikovsky",  // no time signature
      //"Oriental-Granados",  // no time signature
      //"Rustles_of_Spring_Op-32_No-3",   // no time signature
      //"The_Entertainer-Joplin",   // no time signature
      //"Waltz_of_the_Flowers-Tchaikovsky",   // no time signature
      "七子之歌-澳门",
      "G大调变奏曲", // single track
      "不想长大",
      "大鱼海棠",
      "天空之城",
      "Scarborough_Fair",
      "极乐净土",
      "爱的供养",
      "U.N.オーエンは彼女なのか",
      "いつも何度でも",
      "加勒比海盗主题曲",
      "only_my_railgun", // 15
      "檄！帝国華撃団Ⅲ",
      "someone-else",
      "electronic_angel",
      "yyjjxq",
      "幽雅に咲かせ、墨染の桜～Border_of_Life",
      "千本桜",
      "刀剑神域OP",
      "深海少女",
      "CANON IN D",
      "Lemon",
      "Lydia",
      "钟",
      "梁祝",
      "喀秋莎",
      "叶塞尼亚",
      "富士山下",
      "名侦探柯南-主题歌",
      "梦中的婚礼",
      "土耳其进行曲",
      "四季-春",
      "菊次郎的夏天",
      "轻飘飘的时间",
      "克罗地亚狂想曲",
      "Dj_Okawari-Flower_Dance",
      "Red_Alert_Hell_March",
      "柯南与爱尔兰对峙时的背景音乐",
      "兰的决意",
      "Graduation-三枝夕夏",
      "Time after time~在落花纷飞的街道上~《名侦探柯南——迷宫的十字路口》主题"
    ];




function MIDIDemoInit() {
  tmp_fileIndex = getParam("mi");
  //var fileIndex = 29;     // time signature test
  //var fileIndex = 16;     // key signature test
  //var fileIndex = 2;
  //var fileIndex = 17;       // conflict between two track
  fileIndex = (tmp_fileIndex != null) ? tmp_fileIndex : 17;

  // make catalog
  makeCatalog(filelist, x => x);
  document.getElementById("title").innerHTML = filelist[fileIndex];

  var file = "../res/" + filelist[fileIndex] + ".mid";


  var fetch = new XMLHttpRequest();
  fetch.open('GET', file);
  fetch.overrideMimeType('text/plain; charset=x-user-defined');
  fetch.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var ff = [],
          t = this.responseText || '';
        for (var z = 0; z < t.length; z++) {
          ff[z] = String.fromCharCode(t.charCodeAt(z) & 255);
        }
        var midi = MidiFile(ff.join(''));
        var mc = new TMidiConvertor(midi);
        mc.convert();
        console.log(mc);

        var ms = MConvert(mc);
        console.log(ms);

        var es = EConvert(ms);
        console.log(es);

        gct = new GContext(ctx);
        gct.beginBudget(800, 800);

        es.budget(gct, 10, 0);
        console.log(gct);

        gct.print();

        showPage();

        player = new TPlayer(midi, MIDI.Player);
        console.log(midi.tracks)
      } else {
        onerror && onerror('Unable to load MIDI file');
      }
    }
  };
  fetch.send();

  // Play sounds
  window.onload = function() {
    MIDI.loadPlugin({
      soundfontUrl: "../soundfont/",
      //instrument: "synth_drum",
      instruments: ["acoustic_grand_piano", "violin"],
      //    onprogress: function(state, progress) {},
      //    onsuccess: function() {}
    });
  };
}
