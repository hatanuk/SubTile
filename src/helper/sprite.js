
// todo: replace this.data structure with a PackedArray to halve the memory overhead of a sprite

class Sprite {

    constructor(byteArray, width, height, bitDepth = 8) {

        this.width = width
        this.height = height
        this.bitDepth = bitDepth
        this.data = byteArray // UInt8Array of values ranging from 0 to 15 corresponding to the game's palette
    
    }

    // CONSTRUCTORS

    fromBase64RGBA(base64, width, height, inputBitDepth = 8) {
        const bin = atob(base64)
        const rgbaBytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) rgbaBytes[i] = this._normaliseChannel(bin.charCodeAt(i))
        
        let paletteBytes = new Uint8Array(Math.floor(bin.length / 4))
        buf.reduce((paletteIndex, cur, i, src) => {
            if (i % 4 === 0 && i + 3 < src.length) {
                const chunk = src.slice(i, i + 4)
                const val = this._rgbaToPalette(chunk)
                paletteBytes[paletteIndex] = val
                return paletteIndex + 1
            }
            return paletteIndex

        }, 0)

        return new Sprite(paletteBytes, width, height, inputBitDepth)
    }

    // PUBLIC METHODS

    getBitmap() {    
        return this.data.reduce((acc, val, i) => {
            let char = acc + charMap[val]
            if ((i + 1) % this.width === 0) char += "\n"
            return char
        }, "")

    }

    // STATIC METHODS

    static rgbaToChar(rgbaValues) {
        const mappedVal = Sprite._rgbaToPalette(rgbaValues)
        return charMap[mappedVal]
    }

    // PRIVATE METHODS

    static _rgbaToPalette(rgbaValues) {
        let minDif = 5
        let mappedVal

        const alpha = rgbaValues[3]
        const rgbValues = rgbaValues.slice(0, 3)

        if (alpha >= 0.5) {
            return 15
        } 
        for (const [paletteVal, charRgb] of Object.entries(colorMap)) {
            const sumDif = rgbValues.reduce((sumDif, val, index) => 
                sumDif += Math.abs(charRgb[index] - val)
            , 0)


            if (sumDif < minDif) {
                mappedVal = paletteVal
                minDif = sumDif
            }
        }
        return mappedVal

    }

    // PRIVATE METHODS

    _normaliseChannel(channelVal) {
        const normVal = Math.round(channelVal / (2 ** this.bitDepth))
        return normVal
    }

}


const colorMap = {
            0: [0.0,   0.0,   0.0],
            1: [0.282, 0.314, 0.337],
            2: [0.569, 0.592, 0.608],
            3: [0.973, 0.976, 0.980],
            4: [0.922, 0.286, 0.392],
            5: [0.545, 0.251, 0.184],
            6: [0.102, 0.694, 0.976],
            7: [0.071, 0.078, 0.878],
            8: [0.996, 0.906, 0.059],
            9: [0.580, 0.549, 0.200],
            10: [0.176, 0.878, 0.243],
            11: [0.110, 0.584, 0.059],
            12: [0.957, 0.424, 0.733],
            13: [0.667, 0.227, 0.773],
            14: [0.957, 0.439, 0.090]
        }


const CHARS = "0L123C756F4D8H9."

const charMap = Object.fromEntries(
        [...CHARS].map((ch, i) => [i, ch])
        )