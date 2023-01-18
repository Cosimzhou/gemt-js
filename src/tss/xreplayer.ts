function Replayer(midiFile, timeWarp, eventProcessor?: any, bpm?: number) {
  var trackStates = [];
  var beatsPerMinute = bpm ? bpm : 120;
  var bpmOverride = bpm ? true : false;

  console.log("bpm", beatsPerMinute);
  var ticksPerBeat = midiFile.header.ticksPerBeat;

  for (var i = 0; i < midiFile.tracks.length; i++) {
    trackStates[i] = {
      'nextEventIndex': 0,
      'ticksToNextEvent': (
        midiFile.tracks[i].length ?
        midiFile.tracks[i][0].deltaTime :
        null
      )
    };
  }

  // var nextEventInfo;
  // var samplesToNextEvent = 0;

  // interface {
  //   ticksToEvent: number // ticks to next event
  //   event: TEvent
  //   track: number // next event track
  // }
  function getNextEvent() {
    var ticksToNextEvent: number = null;
    var nextEventTrack: number = null;
    var nextEventIndex: number = null;

    for (var i = 0; i < trackStates.length; i++) {
      if (trackStates[i].ticksToNextEvent != null &&
        (ticksToNextEvent == null || trackStates[i].ticksToNextEvent <
          ticksToNextEvent)) {
        nextEventTrack = i;
        ticksToNextEvent = trackStates[i].ticksToNextEvent;
        nextEventIndex = trackStates[i].nextEventIndex;
      }
    }
    if (nextEventTrack != null) {
      /* consume event from that track */
      var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
      if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
        trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[
          nextEventTrack][nextEventIndex + 1].deltaTime;
      } else {
        trackStates[nextEventTrack].ticksToNextEvent = null;
      }
      trackStates[nextEventTrack].nextEventIndex += 1;
      /* advance timings on all tracks by ticksToNextEvent */
      for (var i = 0; i < trackStates.length; i++) {
        if (trackStates[i].ticksToNextEvent != null) {
          trackStates[i].ticksToNextEvent -= ticksToNextEvent
        }
      }
      return {
        "ticksToEvent": ticksToNextEvent,
        "event": nextEvent,
        "track": nextEventTrack
      }
    } else {
      return null;
    }
  };
  //
  var midiEvent;
  var temporal = [];
  //
  function processEvents() {
    function processNext() {
      if (!bpmOverride && midiEvent.event.type == "meta" && midiEvent.event
        .subtype == "setTempo") {
        // tempo change events can occur anywhere in the
        // middle and affect events that follow
        beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
      }
      ///
      let secondsToGenerate = 0;
      if (midiEvent.ticksToEvent > 0) {
        let beatsToGenerate = midiEvent.ticksToEvent / ticksPerBeat;
        secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
      }
      ///
      let millisecondToGenerate = (secondsToGenerate * 1000 * timeWarp) || 0;
      temporal.push([midiEvent, millisecondToGenerate]);
      midiEvent = getNextEvent();

      console.log("processNext");
    };
    ///
    if (midiEvent = getNextEvent()) {
      while (midiEvent) processNext();
    }
  };
  processEvents();

  console.log("xreplayer", timeWarp, temporal);
  return new XReplayer(temporal);
};

class XReplayer {
  temporal: any
  constructor(temporal){
    this.temporal = temporal;
  }

  getData(): any {
    return clone(this.temporal);
  }

  getLength(): number {
    var data = this.temporal;
    var length = data.length;
    var totalTime = 0.5;
    for (var n = 0; n < length; n++) {
      totalTime += data[n][1];
    }

    return totalTime;
  }
}
