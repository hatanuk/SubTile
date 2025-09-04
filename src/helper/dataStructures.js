


class PackedArray {

    constructor(size) {

        /* maps each char to a numeric value 0-15 for more efficient storage, 
        with two chars being stored as a single element in a Uint8Array
        (as a side effect, the array must contain an even number of chars or be padded)
        */ 

        this.size = size

        this.charToNibble = {
            ".": 0x0,
            "1": 0x1,
            "2": 0x2,
            "3": 0x3,
            "4": 0x4,
            "5": 0x5,
            "6": 0x6,
            "7": 0x7,
            "8": 0x8,
            "9": 0x9,
            "L": 0xA,
            "C": 0xB,
            "D": 0xC,
            "F": 0xD,
            "H": 0xE,
            "0":  0xF 
        }

        this.nibbleToChar = Object.fromEntries(
        Object.entries(this.charToNibble).map(([k, v]) => [v, k])
        );

        this.values = new Uint8Array(this.size / 2)

    }

    resetValues() {
        this.values = new Uint8Array(this.size / 2)
    }

    getByteIndex(index) {
        return index >> 1;
    }

    getValue(index) {
        const byteIndex = this.getByteIndex(index)
        const shift = (index & 1) ? 0 : 4 // shift is required for high nibbles
        return this.values[byteIndex] >> shift & 0xF // extracts lowest 4 bits
    }

    setValue(index, val) {

        const byteIndex = this.getByteIndex(index)
        const shift = (index & 1) ? 0 : 4
        const mask = (index & 1) ? 0xF0 : 0x0F
        this.values[byteIndex]= (this.values[byteIndex] & mask) | ((val & 0xF) << shift) // clears target nibble, sets target nibble to value using OR
    
    }

    getChar(index) {
        return this.nibbleToChar[this.getValue(index)]
    }

    setChar(index, char) {
        this.setValue(index, this.charToNibble[char])
    }

}


class Transform2D {
  // Represents a 2D affine transformation matrix for mapping canvas pixels onto screen space
  constructor(T00, T01, T10, T11, b0, b1) {
    this.T00 = T00; this.T01 = T01; this.b0 = b0
    this.T10 = T10, this.T11 = T11; this.b1 = b1
  }

  multiply(other) {

    const T00 = this.T00 * other.T00 + this.T01 * other.T10;
    const T01 = this.T00 * other.T01 + this.T01 * other.T11;
    const b0  = this.T00 * other.b0  + this.T01 * other.b1 + this.b0;

    const T10 = this.T10 * other.T00 + this.T11 * other.T10;
    const T11 = this.T10 * other.T01 + this.T11 * other.T11;
    const b1  = this.T10 * other.b0  + this.T11 * other.b1 + this.b1;

    return new Transform2D(T00, T01, T10, T11, b0, b1)

  }

  transformX(x, y) {
    return this.T00 * x + this.T01 * y + this.b0
  }

  transformY(x, y) {
    return this.T10 * x + this.T11 * y + this.b1
  }

}