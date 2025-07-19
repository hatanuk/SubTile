class Canvas {

  constructor(width, height) {

    this.width = width
    this.height = height

    this.xOffset = 0
    this.yOffset = 0
    this.scaleY = 0
    this.scaleX = 0
    
    this.updateTransformMatrix()
      
    // 2D canvas represented as a packed 1D buffer
    this.buffer = new PackedArray(this.width * this.height)
    this.drawer = new CanvasDrawer(this.buffer, this.width, this.height)


    // dynamically binds all publicc CanvasDrawer methods to Canvas
    for (const key of Object.getOwnPropertyNames(CanvasDrawer.prototype)) {
      if (key !== 'constructor' && key[0] !== "_" && typeof this.drawer[key] === 'function') {
        this[key] = this.drawer[key].bind(this.drawer);
      }
    }

  }

  updateTransformMatrix() {
     // affine transformation matrix
    this.T = new Transform2D(
        this.scaleX, 0,
        0, this.scaleY,
        this.xOffset, this.yOffset
    )
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


  clearRect(x, y, width, height) {
    this.drawRect(x, y, width, height, ".")
  }

  clearCanvas() {
    this.buffer.resetValues()
  }

  drawLine(x0, y0, x1, y1, char) {
    x0 = x0 | 0
    y0 = y0 | 0
    x1 = x1 | 0
    y1 = y1 | 0

    let dx = Math.abs(x1 - x0)
    let dy = Math.abs(y1 - y0)
    let sx = x0 < x1 ? 1 : -1
    let sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    while (true) {
      if (this._isInBounds(x0, y0)) {
        this.buffer.setChar(this._getBufferIndex(x0, y0), char)
      }

      if (x0 === x1 && y0 === y1) break

      let e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x0 += sx
      }
      if (e2 < dx) {
        err += dx
        y0 += sy
      }
    }
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

