
function LargePowerOf2(x) {
	x |= (x >> 1);
	x |= (x >> 2);
	x |= (x >> 4);
	x |= (x >> 8);
	x |= (x >> 16);
	return (x & ~(x >> 1));
}

function CountBits(bits) {
	bits = bits - ((bits & 0xAAAAAAAA) >> 1);
	bits = ((bits & 0xCCCCCCCC) >> 2) + (bits & 0x33333333);
	bits = ((bits >> 4) + bits) & 0x0F0F0F0F;
	return (bits * 0x01010101) >> 24;
}

function Log2(n) {
	return n? CountBits(LargePowerOf2(n)-1): -1;
}

