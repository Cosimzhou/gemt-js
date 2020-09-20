function StreamString(str) {
	var position = 0;

	function read(length) {
		var result = str.substr(position, length);
		position += length;
		return result;
	}

	/* read a big-endian 32-bit integer */
	function readInt32() {
		var result = (
			(str.charCodeAt(position) << 24)
			+ (str.charCodeAt(position + 1) << 16)
			+ (str.charCodeAt(position + 2) << 8)
			+ str.charCodeAt(position + 3));
		position += 4;
		return result;
	}

	/* read a big-endian 16-bit integer */
	function readInt16() {
		var result = (
			(str.charCodeAt(position) << 8)
			+ str.charCodeAt(position + 1));
		position += 2;
		return result;
	}

	/* read an 8-bit integer */
	function readInt8(signed) {
		var result = str.charCodeAt(position);
		if (signed && result > 127) result -= 256;
		position += 1;
		return result;
	}

	function eof() {
		return position >= str.length;
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
		eof: eof,
    tell: tell,
		read: read,
		readRaw: read,
		readInt8: readInt8,
		readInt32: readInt32,
		readInt16: readInt16,
		readVarInt: readVarInt
	}
}

/// NodeJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stream;
}
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
		eof: eof,
    tell: tell,
		read: read,
    readRaw: readRaw,
		readInt8: readInt8,
		readInt32: readInt32,
		readInt16: readInt16,
		readVarInt: readVarInt
	}
}

var Stream = StreamFileObject;
/// NodeJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stream;
} else {
  Stream = StreamString;
}
