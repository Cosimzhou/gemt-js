function StreamString(str) {
  this._position = 0;
  this._data = str;
}

StreamString.prototype._read =	function (length) {
  var result = this._data.substr(this._position, length);
  this._position += length;
  return result;
}

/* read a big-endian 32-bit integer */
StreamString.prototype._readInt32 =function readInt32() {
  var result = (
    (this._data.charCodeAt(this._position) << 24)
    + (this._data.charCodeAt(this._position + 1) << 16)
    + (this._data.charCodeAt(this._position + 2) << 8)
    + this._data.charCodeAt(this._position + 3));
  this._position += 4;
  return result;
}

/* read a big-endian 16-bit integer */
StreamString.prototype._readInt16 =	function readInt16() {
  var result = (
    (this._data.charCodeAt(this._position) << 8)
    + this._data.charCodeAt(this._position + 1));
  this._position += 2;
  return result;
}

/* read an 8-bit integer */
StreamString.prototype._readInt8 =	function readInt8(signed) {
  var result = this._data.charCodeAt(this._position);
  if (signed && result > 127) result -= 256;
  this._position += 1;
  return result;
}

StreamString.prototype._eof =	function eof() {
  return this._position >= this._data.length;
}

StreamString.prototype._tell =    function tell() {
  return this._position;
}

/* read a MIDI-style variable-length integer
  (big-endian value in groups of 7 bits,
  with top bit set to signify that another byte follows)
*/
StreamString.prototype._readVarInt =	function readVarInt() {
  var result = 0;
  while (true) {
    var b = this._readInt8();
    if (b & 0x80) {
      result += (b & 0x7f);
      result <<= 7;
    } else {
      /* b is the last byte */
      return result + b;
    }
  }
}

function Stream(data) {
  return new StreamString(data);
}

// 	return {
// 		_eof: eof,
//     _tell: tell,
// 		_read: read,
// 		_readRaw: read,
// 		_readInt8: readInt8,
// 		_readInt32: readInt32,
// 		_readInt16: readInt16,
// 		_readVarInt: readVarInt
// 	}
// }

/// NodeJS
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = Stream;
// }
//else {
//    window.Stream = Stream;
//}
//})();
/* Wrapper for accessing bufings through sequential reads */
//(function() {
function StreamFileObject(buf) {
	var position = 0;
    //if (typeof buf === 'string') buf = new Buffer(buf);

	function read(length) {
		var result = buf.toString('utf-8', position, position + length);
		position += length;
		return result;
	}

	function readRaw(length) {
		var result = buf.slice(position, position + length);
		position += length;
		return result;
	}

	/* read a big-endian 32-bit integer */
	function readInt32() {
		var result = buf.readUInt32BE(position);
		position += 4;
		return result;
	}

	/* read a big-endian 16-bit integer */
	function readInt16() {
		var result = buf.readUInt16BE(position);
		position += 2;
		return result;
	}

	/* read an 8-bit integer */
	function readInt8(signed) {
		var result = buf.readUInt8(position);
		if (signed && result > 127) result -= 256;
		position += 1;
		return result;
	}

	function eof() {
		return position >= buf.length;
	}
  function tell() {
    return position;
  }

	/* read a MIDI-style variable-length integer
		(big-endian value in groups of 7 bits,
		with top bit set to signify that another byte follows)
	*/
	function readVarInt() {
		var result = 0;
		while (true) {
			var b = readInt8();
			if (b & 0x80) {
				result += (b & 0x7f);
				result <<= 7;
			} else {
				/* b is the last byte */
				return result + b;
			}
		}
	}

	return {
		_eof: eof,
    _tell: tell,
		_read: read,
    _readRaw: readRaw,
		_readInt8: readInt8,
		_readInt32: readInt32,
		_readInt16: readInt16,
		_readVarInt: readVarInt
	}
}

// var Stream = StreamFileObject;
// /// NodeJS
// if (typeof module !== 'undefined' && module.exports) {
//     //module.exports = Stream;
// } else {
//   Stream = StreamString;
// }
