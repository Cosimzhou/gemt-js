/********************************
 *
 * TMidiConvertor
 *
 * @constructor
 *******************************/

function TMidiConvertor(raw) {
  this.raw = raw;
  this._header = raw['header'];
  this._intracks = raw['tracks'];
}
exports.TMidiConvertor = TMidiConvertor;

TMidiConvertor.prototype.convert = function() {
  var eventList = [];
  var usedChannels = new Set();
  var ticksPerBeat = this._header.ticksPerBeat;

  function translate_track(strack, track, trkId) {
    var currentTime = 0,
      opened_notes = {},
      instrument = null;

    function getDigest(e) {
      return e['noteNumber'] + "%" + e['channel'] + "%" + instrument;
    }

    for (var event of strack) {
      currentTime += event['deltaTime'];
      var subtype = event['subtype'];
      if (subtype == "setTempo" || subtype == "timeSignature" ||
        subtype == "keySignature") {
        var newEvent = {
          trkId: trkId,
          startBeat: currentTime / ticksPerBeat,
          stime: currentTime,
          subtype: subtype,
          numerator: event['numerator'],
          denominator: event['denominator'],
          key: event['key'],
          microsecondsPerBeat: event['microsecondsPerBeat'],
        };
        eventList.push(newEvent);
      } else if (subtype == "noteOn") {
        var note = new TNote(event['noteNumber'], currentTime);
        note.startBeat = currentTime / ticksPerBeat;
        note.sveloc = event['velocity'];
        note._channel = event['channel'];
        usedChannels.add(note._channel);
        note.instrument = instrument;
        note._tpb = ticksPerBeat;
        note._onEnv = event;
        track.append(note);
        var digest = getDigest(event);
        if (opened_notes[digest] == null) {
          opened_notes[digest] = [];
        }
        opened_notes[digest].push(note);
      } else if (subtype == "noteOff") {
        var digest = getDigest(event);
        var opennotes = opened_notes[digest];
        if (opennotes && opennotes[0]) {
          var opennote = opennotes.shift();
          if (opennotes.length == 0) {
            delete opened_notes[digest];
          }

          opennote.etime = currentTime;
          opennote.endBeat = currentTime / ticksPerBeat;
          opennote.eveloc = event['velocity'];
          opennote.beat = opennote.endBeat - opennote.startBeat;
          opennote._offEnv = event;
          if (opennote.beat == 0) {
            console.error("what's the fuck!", opennote);
          }
        } else {
          console.error("unopened note turn off!");
        }
      } else if (subtype == "programChange") {
        instrument = event['programNumber'];
      }
    }
  }

  var cmp = function(a, b) {
    return a.startBeat - b.startBeat;
  }
  this.eventList = eventList;
  this._tracks = [];
  for (var i = 0; i < this._header.trackCount; ++i) {
    var track = new TTrack();
    translate_track(this._intracks[i], track, i);
    if (track.notes.length) {
      track.notes.sort(cmp);
      track.detectBeat();
      track.fusion();
      track.tempoFollow(this.eventList, ticksPerBeat);
      this._tracks.push(track);
    }
  }
  delete this._intracks;
  delete this.raw;

  this.eventList.sort(cmp);
  this.channels = Array.from(usedChannels);
  this.channels.sort();
  console.log(this.eventList)
}

TMidiConvertor.prototype.Play = function() {
  var snd = new TSounder();
  snd.adapt(MIDI);
  for (var chn of this.channels)
    snd.instrument(chn, 0, 0);
  snd.volume(0, 127);

  for (var ti = 0, trk; trk = this._tracks[ti]; ++ti) {
    for (var i = 0, c; c = trk.chords[i]; i++)
      c._sound(snd, 0);
  }
  this._sounder = snd;
}

TMidiConvertor.prototype.Stop = function() {
  if (this._sounder) this._sounder.stop();
}
