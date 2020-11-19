
function MidiFile(data) {
  function readChunk(stream) {
    var id = stream._read(4);
    var length = stream._readInt32();
    return {'id': id, 'length': length, _data: stream._read(length)};
  }

  var lastEventTypeByte;

  function readEvent(stream) {
    var event = {};
    event.deltaTime = stream._readVarInt();
    var eventTypeByte = stream._readInt8();
    if ((eventTypeByte & 0xf0) == 0xf0) {
      /* system / meta event */
      if (eventTypeByte == 0xff) {
        /* meta event */
        event.type = 'meta';
        var subtypeByte = stream._readInt8();
        var length = stream._readVarInt();
        switch (subtypeByte) {
          case 0x00:
            event._subtype = 'sequenceNumber';
            if (length != 2)
              throw 'Expected length for sequenceNumber event is 2, got ' +
                  length;
            event._number = stream._readInt16();
            return event;
          case 0x01:
            event._subtype = '_text';
            event._text = stream._read(length);
            return event;
          case 0x02:
            event._subtype = 'copyrightNotice';
            event._text = stream._read(length);
            return event;
          case 0x03:
            event._subtype = 'trackName';
            event._text = stream._read(length);
            return event;
          case 0x04:
            event._subtype = 'instrumentName';
            event._text = stream._read(length);
            return event;
          case 0x05:
            event._subtype = 'lyrics';
            event._text = stream._read(length);
            return event;
          case 0x06:
            event._subtype = 'marker';
            event._text = stream._read(length);
            return event;
          case 0x07:
            event._subtype = 'cuePoint';
            event._text = stream._read(length);
            return event;
          case 0x20:
            event._subtype = 'midiChannelPrefix';
            if (length != 1)
              throw 'Expected length for midiChannelPrefix event is 1, got ' +
                  length;
            event._channel = stream._readInt8();
            return event;
          case 0x2f:
            event._subtype = 'endOfTrack';
            if (length != 0)
              throw 'Expected length for endOfTrack event is 0, got ' + length;
            return event;
          case 0x51:
            event._subtype = 'setTempo';
            if (length != 3)
              throw 'Expected length for setTempo event is 3, got ' + length;
            event._microsecondsPerBeat =
                ((stream._readInt8() << 16) + (stream._readInt8() << 8) +
                 stream._readInt8())
            return event;
          case 0x54:
            event._subtype = 'smpteOffset';
            if (length != 5)
              throw 'Expected length for smpteOffset event is 5, got ' + length;
            var hourByte = stream._readInt8();
            event._frameRate =
                {0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30}[hourByte & 0x60];
            event.hour = hourByte & 0x1f;
            event.min = stream._readInt8();
            event.sec = stream._readInt8();
            event.frame = stream._readInt8();
            event._subframe = stream._readInt8();
            return event;
          case 0x58:
            event._subtype = 'timeSignature';
            if (length != 4)
              throw 'Expected length for timeSignature event is 4, got ' +
                  length;
            event.numerator = stream._readInt8();
            event.denominator = Math.pow(2, stream._readInt8());
            event._metronome = stream._readInt8();
            event._thirtyseconds = stream._readInt8();
            return event;
          case 0x59:
            event._subtype = 'keySignature';
            if (length != 2)
              throw 'Expected length for keySignature event is 2, got ' +
                  length;
            event.key = stream._readInt8(true);
            event._scale = stream._readInt8();
            console.log('keySignature ', event);
            return event;
          case 0x7f:
            event._subtype = 'sequencerSpecific';
            event._data = stream._read(length);
            return event;
          default:
            // console.log("Unrecognised meta event _subtype: " + subtypeByte);
            event._subtype = 'unknown'
            event._data = stream._read(length);
            return event;
        }
        event._data = stream._read(length);
        return event;
      } else if (eventTypeByte == 0xf0) {
        event.type = 'sysEx';
        var length = stream._readVarInt();
        event._data = stream._read(length);
        return event;
      } else if (eventTypeByte == 0xf7) {
        event.type = 'dividedSysEx';
        var length = stream._readVarInt();
        event._data = stream._read(length);
        return event;
      } else {
        throw 'Unrecognised MIDI event type byte: ' + eventTypeByte + '#' +
            stream._tell();
      }
    } else {
      /* channel event */
      var param1;
      if ((eventTypeByte & 0x80) == 0) {
        /* running status - reuse lastEventTypeByte as the event type.
            eventTypeByte is actually the first parameter
        */
        param1 = eventTypeByte;
        eventTypeByte = lastEventTypeByte;
      } else {
        param1 = stream._readInt8();
        lastEventTypeByte = eventTypeByte;
      }
      var eventType = eventTypeByte >> 4;
      event._channel = eventTypeByte & 0x0f;
      event.type = 'channel';
      switch (eventType) {
        case 0x08:
          event._subtype = 'noteOff';
          event._noteNumber = param1;
          event._velocity = stream._readInt8();
          return event;
        case 0x09:
          event._noteNumber = param1;
          event._velocity = stream._readInt8();
          if (event._velocity == 0) {
            event._subtype = 'noteOff';
          } else {
            event._subtype = 'noteOn';
          }
          return event;
        case 0x0a:
          event._subtype = 'noteAftertouch';
          event._noteNumber = param1;
          event.amount = stream._readInt8();
          return event;
        case 0x0b:
          event._subtype = 'controller';
          event._controllerType = param1;
          event.value = stream._readInt8();
          return event;
        case 0x0c:
          event._subtype = 'programChange';
          event._programNumber = param1;
          return event;
        case 0x0d:
          event._subtype = 'channelAftertouch';
          event.amount = param1;
          return event;
        case 0x0e:
          event._subtype = 'pitchBend';
          event.value = param1 + (stream._readInt8() << 7);
          return event;
        default:
          throw 'Unrecognised MIDI event type: ' + eventType
          /*
          console.log("Unrecognised MIDI event type: " + eventType);
          stream.readInt8();
          event._subtype = 'unknown';
          return event;
          */
      }
    }
  }

  var stream = Stream(data);
  var headerChunk = readChunk(stream);
  if (headerChunk.id != 'MThd' || headerChunk.length != 6) {
    throw "Bad .mid file - header not found";
  }
  var headerStream = Stream(headerChunk._data);
  var formatType = headerStream._readInt16();
  var trackCount = headerStream._readInt16();
  var timeDivision = headerStream._readInt16();

  var ticksPerBeat = timeDivision;
  if (timeDivision & 0x8000) {
    throw "Expressing time division in SMTPE frames is not supported yet"
  }

  var header = {
    formatType: formatType,
    trackCount: trackCount,
    ticksPerBeat: ticksPerBeat
  }
  var tracks = [];
  for (var i = 0; i < header.trackCount; i++) {
    tracks[i] = [];
    var trackChunk = readChunk(stream);
    if (trackChunk.id != 'MTrk') {
      throw 'Unexpected chunk - expected MTrk, got ' + trackChunk.id;
    }
    var trackStream = Stream(trackChunk._data);
    while (!trackStream._eof()) {
      var event = readEvent(trackStream);
      tracks[i].push(event);
      // console.log(event);
    }
  }

  return {
    _header: header,
    _tracks: tracks
  }
}
exports.MidiFile = MidiFile;
