


class PackedArray {

    constructor(size) {

        /* maps each char to a numeric value 0-15 for more efficient storage, 
        with two chars being stored as a single element in a Uint8Array
        (as a side effect, the array must contain an even number of chars or be padded)
        */ 

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

        this.values = new Uint8Array(size / 2)

    }

    getValue(index) {
        const byteIndex = Math.floor(index / 2)
        const isHighNibble = index % 2 == 0


        if (isHighNibble) {
            // shift to right, mask
            return (this.values[byteIndex] >> 4) & 0xF
        } else {
            // just mask
            return (this.values[byteIndex] & 0xF)
        }
    }

    setValue(index, val) {

        if (val > 0xF) return;

        const byteIndex = Math.floor(index / 2)
        const isHighNibble = index % 2 == 0

        if (isHighNibble) {
            // clears the high nibble
            this.values[byteIndex] = this.values[byteIndex] & 0xF
            // sets high nibble to a shifted value using logical OR
            this.values[byteIndex] = this.values[byteIndex] | (val << 4)

        } else {
             // clears the low nibble
            this.values[byteIndex] = this.values[byteIndex] & 0xF0
            // sets low nibble to the value using logical OR
            this.values[byteIndex] = this.values[byteIndex] | val
        }

    
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

}