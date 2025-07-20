class Sprite {

    colorMap = {
            "0": [0, 0, 0],
            "L": [72, 80, 86],
            "1": [145, 151, 155],
            "2": [248, 249, 250],
            "3": [235, 73, 100],
            "C": [139, 64, 47],
            "7": [26, 177, 249],
            "5": [18, 20, 224],
            "6": [254, 231, 15],
            "F": [148, 140, 51],
            "4": [45, 224, 62],
            "D": [28, 149, 15],
            "8": [244, 108, 187],
            "H": [170, 58, 197],
            "9": [244, 112, 23]
        }

    constructor(rgbArray, width, height) {

   

        this.width = width
        this.height = height
        this.init(rgbArray, width, height)

    }
    
    init(rgbArray, width, height) {

        let charArray = this.rgbArrayToCharArray(rgbArray, width, height)

        // ensure all values will be filled by padding odd-numbered charArrays
        if (charArray.length % 2 != 0) {charArray.push(".")}

        // compress two chars into a single byte stored as an element in Uint8Array
        this.cArray = new PackedArray(charArray.length)

        // populate packed array
        charArray.forEach((char, index) => this.cArray.setChar(index, char))

    }

    rgbArrayToCharArray(rgbArray, width, height) {

        let charArray = []

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (x + y * width) * 3
                let rgbValue = rgbArray.slice(index, index + 3)
                let mappedChar = this.rgbValueToChar(rgbValue)
                charArray.push(mappedChar)

            }
        }
        return charArray
    }

    rgbValueToChar(rgbValue) {
        let smallestDif = 255 * 3
        let mappedChar = "."

        for (const [char, charRgb] of Object.entries(this.colorMap)) {
            const sumDif = rgbValue.reduce((sumDif, val, index) => 
                sumDif += Math.abs(charRgb[index] - val)
            , 0)


            if (sumDif < smallestDif) {
                mappedChar = char
                smallestDif = sumDif
            }
        }

        return mappedChar
    }

    getBitmap() {
        let bitmap = ""
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let index = y * this.width + x
                bitmap += this.cArray.getChar(index)
            }
            bitmap += "\n"
        }
        return bitmap
        }
}
