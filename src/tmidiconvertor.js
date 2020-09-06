
function TMidiConvertor(raw) {
  this.raw = raw;
  this.header = raw.header;
  this._intracks = raw.tracks;
}
exports['TMidiConvertor'] = TMidiConvertor;
TMidiConvertor.prototype['convert'] = function(){
  var eventList = [];
  var ticksPerBeat = this.header['ticksPerBeat'];
  function translate_track(strack, track, trkId) {
    var currentTime = 0, opened_notes = {}, instrument = null;
    function getDigest(e){
      return e.noteNumber +"%"+ e.channel+"%"+instrument;
    }

    for (var event of strack) {
      currentTime += event.deltaTime;
      if (event.subtype == "setTempo" ||
          event.subtype == "timeSignature" ||
          event.subtype == "keySignature") {
        event.trkId = trkId;
        event.startBeat = currentTime/ticksPerBeat;
        event.subtype = event.subtype;
        eventList.push(event);
      } else if (event.subtype == "noteOn"){
        var note = new TNote(event.noteNumber, currentTime);
        note.startBeat = currentTime / ticksPerBeat;
        note.sveloc = event.velocity;
        note.channel = event.channel;
        note.instrument = instrument;
        track.append(note);
        var digest = getDigest(event);
        if (opened_notes[digest] == null) {
          opened_notes[digest] = [];
        }
        opened_notes[digest].push(note);
      } else if (event.subtype == "noteOff") {
        var opennotes = opened_notes[getDigest(event)];
        if (opennotes && opennotes[0]) {
          var opennote = opennotes.shift();
          if (opennotes.length == 0) {
            delete opened_notes[getDigest(event)];
          }

          opennote.etime = currentTime;
          opennote.endBeat = currentTime / ticksPerBeat;
          opennote.eveloc = event.velocity;
          opennote.beat = opennote.endBeat - opennote.startBeat;
          if (opennote.beat == 0) {
            console.error("what's the fuck!", opennote);
          }
        } else {
          console.error("unopened note turn off!");
        }
      } else if (event.subtype == "programChange") {
          instrument = event.programNumber;
      }
    }
  }

  this.tracks = [];
  for (var i = 0; i < this.header.trackCount; ++i) {
    var track = new TTrack();
    this.tracks.push(track);
    translate_track(this._intracks[i], track, i);
    track.notes.sort(function(a,b){return a.startBeat-b.startBeat;});
    track.detectBeat();
    track.fusion();
  }
  delete this._intracks;

  this.eventList = eventList;
  this.eventList.sort(function(a,b){return a.startBeat-b.startBeat});
  delete this.raw;
}
