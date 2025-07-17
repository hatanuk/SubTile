class PixelRenderer {

  /*
  Allows tile-based renderers (such as Sprig) to display pixels at arbitrary coordinates 
  by dynamically updating the legend.

  Usage: 
  setPixel(x, y, char) - draws a pixel at a given coordinate
  renderFrame(x, y, char) - refreshes the legend to apply changes

  */ 

  constructor(screenWidth, screenHeight) {


    this.tileSize = 16
    this.screenTileWidth = Math.ceil(screenWidth / this.tileSize)
    this.screenTileHeight = Math.ceil(screenHeight / this.tileSize)

    this.canvases = []

    this.buffer = new PackedArray(this.screenTileHeight * this.screenTileWidth * this.tileSize * this.tileSize)

    // creates a bitmap representing each tile, mapped to a unique character
    let rows = new Array(this.screenTileHeight)
    for (let ty = 0; ty < this.screenTileHeight; ty++) {
      let row = new Array(this.screenTileWidth)
      for (let tx = 0; tx < this.screenTileWidth; tx++) {
       
        row[tx] = (this._tileToBitmapKey(tx, ty))
      }
      rows[ty] = row.join("")
      
    }
    this.tileBitmap = rows.join("\n")
    

  }

  addCanvas(canvas) {
    this.canvases.push(canvas)
  }

  drawPixel(x, y, char) {
    this.buffer.setChar(this._getBufferIndex(x, y), char)
  }

  renderFrame() {
      // around 2.3 ms per call
    
    let newLegend = []
    const updateLegend = (tx, ty) => {
      const bitmap = this._tileToBitmap(tx, ty)
      const bitmapKey = this._tileToBitmapKey(tx, ty)

    
      newLegend.push([bitmapKey, bitmap])
    }

    // draws mapped pixels from each canvas onto screen buffer (forward pass)
    this.canvases.forEach(
      canvas => {
        canvas.getMappedCoordinates().forEach(
        coord => {
          this.drawPixel(coord.x, coord.y, coord.char)
        })
        }
      )
    

    // convert each tile (from buffer) to a bitmap and add it to the legend
    for (let ty = 0; ty < this.screenTileHeight; ty++) {
      for (let tx = 0; tx < this.screenTileWidth; tx++) {
        updateLegend(tx, ty)
      }
    }

    setLegend(...newLegend)

    setMap(this.tileBitmap)
    
  }

  // PRIVATE METHODS

  _tileToBitmapKey(tx, ty) {
    return String.fromCharCode(47 + ty * 10 + tx);
  }

  _tileToBitmap(tx, ty) {
    let bitmapRows = new Array(this.tileSize)
    const startX = tx * this.tileSize
    const startY = ty * this.tileSize

    for (let y = 0; y < this.tileSize; y++) {
      let row = new Array(this.tileSize)
      for (let x = 0; x < this.tileSize; x++) {
        row[x] = (this.buffer.getChar(this._getBufferIndex(startX + x, startY + y)))
      }
      bitmapRows[y] = row.join("")
    }

    return bitmapRows.join("\n")
}

  _getBufferIndex(x, y) {
    return x + y * this.screenTileWidth * this.tileSize
  }
}

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

class CanvasDrawer {

  constructor(buffer, width, height) { 

    this.buffer = buffer
    this.width = width
    this.height = height

    if (!Number.isInteger(this.height)) {
        throw new Error("Buffer length must be divisible by width.");
    }

  }  


  // PUBLIC METHODS

  drawPixel(x, y, char) {
    // around 0.0033 ms per call

    x = x | 0;
    y = y | 0;

    if (!this._isInBounds(x, y)) return;

    this.buffer.setChar(this._getBufferIndex(x, y), char)
  }

  drawRect(x, y, rectWidth, rectHeight, char) {
      // around 0.10 ms per call

      x = x | 0;
      y = y | 0;

      if (!this._isInBounds(x, y)) return;

      const xEnd = Math.min(this.width, x + rectWidth)
      const yEnd = Math.min(this.height, y + rectHeight)

      for (let yi = y; yi < yEnd; yi++) {
        for (let xi = x; xi < xEnd; xi++) { 
            this.buffer.setChar(this._getBufferIndex(xi, yi), char)
          }
      }

  } 

  drawCircle(cx, cy, radius, char) {
    cx = cx | 0;
    cy = cy | 0;
    radius = Math.max(1, radius | 0);
  
    const radiusSq = radius * radius;
    const xStart = Math.max(0, cx - radius);
    const yStart = Math.max(0, cy - radius);
    const xEnd = Math.min(this.width, cx + radius + 1);
    const yEnd = Math.min(this.height, cy + radius + 1);
  
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx + dy * dy) <= radiusSq) {
          this.buffer.setChar(this._getBufferIndex(x, y), char)
        }
      }
    }
  }


  clearRect({x, y, width, height}) {
    this.drawRect(x, y, width, height, "2")
  }


  drawSprite(x, y, sprite) {


    const xEnd = Math.min(sprite.width + x, this.width)
    const yEnd = Math.min(sprite.height + y, this.height)

    for (let yi = y; yi < yEnd; yi++) {
        for (let xi = x; xi < xEnd; xi++) {
            let indexBuffer = this._getBufferIndex(xi, yi)
            let indexSprite = (xi - x) + (yi - y) * sprite.width
            this.buffer.setChar(indexBuffer, sprite.cArray.getChar(indexSprite))
      
        }
    }
  }


  // PRIVATE METHODS

   _isInBounds(x, y) {
    return y < this.height && y >= 0
    && x < this.width && x >= 0
  }

  _getBufferIndex(x, y) {
    return x + y * this.width
  }

}

class Canvas {

  constructor(x, y, width, height, scaleX=1, scaleY=1) {

    this.width = width
    this.height = height
    
    // affine transformation matrix

    this.T = new Transform2D(
        scaleX, 0,
        0, scaleY,
        x, y
    )
      
    // 2D canvas represented as a packed 1D buffer
    this.buffer = new PackedArray(this.width * this.height)
    this.drawer = new CanvasDrawer(this.buffer, this.width, this.height)

  }

  getMappedCoordinates() {

    // Maps all non-"." values to the screen space and returns their coordinates and value

    const charFilter = (char) => char !== "."
    let mappedCoordinates = []

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let char = this.buffer.getChar(this._getBufferIndex(x, y))

        if (!charFilter(char)) continue;

        mappedCoordinates.push({
          x: Math.floor(this._transformX(x, y)), 
          y: Math.floor(this._transformY(x, y)), 
          char})
      }
    }

    return mappedCoordinates
  }

  _transformX(x, y) {
    return this.T.T00 * x + this.T.T01 * y + this.T.b0
  }

  _transformY(x, y) {
    return this.T.T10 * x + this.T.T11 * y + this.T.b1
  }

  _getBufferIndex(x, y) {
    return x + y * this.width
  }

}



class Transform2D {
  // Represents a 2D affine transformation matrix for mapping canvas pixels onto screen space
  constructor(T00, T01, T10, T11, b0, b1) {
    this.T00 = T00; this.T01 = T01; this.b0 = b0
    this.T10 = T10, this.T11 = T11; this.b1 = b1
  }

}
