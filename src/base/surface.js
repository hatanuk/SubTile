
class Surface {

  constructor(width, height) {

    this.width = width
    this.height = height

    // affine transformation matrix
    this.T = new Transform2D(
        1, 0,
        0, 1,
        0, 0
    )
      
    this.buffer = new Buffer(this.width, this.height)
    this.drawer = new Drawer(this.buffer)

    // dynamically binds all public Drawer methods to Surface
    this._bindDrawerMethods()

  }

  applyTransformation(T) {
    this.T = this.T.multiply(T)
  }

  resetTransformations() {
    this.T = new Transform2D(
        1, 0,
        0, 1,
        0, 0
    )
  }

  // TRANSFORMATION INTERFACES 

  rotate(radians) {
    const cosRad = Math.cos(radians)
    const sinRad = Math.sin(radians)
    this.applyTransformation(new Transform2D(
      cosRad, -sinRad,
      sinRad, cosRad,
      0, 0
    ))
  }

  shear(shearX=0, shearY=0) {
    this.applyTransformation(new Transform2D(
      1, shearX,
      shearY, 1,
      0, 0
    ))
  }

  scale(scaleX=1, scaleY=1) {
    this.applyTransformation(new Transform2D(
      Math.abs(scaleX), 0,
      0, Math.abs(scaleY),
      0, 0
    ))
  }



  isTransformed() {
    // returns whether the surface has been scaled or skewed, requiring each pixel to undergo a transformation calculation
    // offset transformations can be blitted efficiently and are not counted

    return this.T.T00 !== 1 || this.T.T11 !== 1 || this.T.T01 !== 0 || this.T.T10 !== 0

  }

  getTransformedPixels() {

    // maps all non-"." values to the screen space and returns their coordinates and value

    const charFilter = (char) => char !== "."
    const out = []
    let transformedCoordinates = []

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let char = this.buffer.getChar(x, y)

        if (!charFilter(char)) continue;

        transformedCoordinates.push({
          x: Math.floor(this.T.transformX(x, y)), 
          y: Math.floor(this.T.transformY(x, y)), 
          char})
      }
    }

    return transformedCoordinates
  }


  _bindDrawerMethods() {
    for (const key of Object.getOwnPropertyNames(Drawer.prototype)) {
      if (key !== 'constructor' && key[0] !== "_" && typeof this.drawer[key] === 'function') {
        const drawFn = this.drawer[key].bind(this.drawer)
        this[key] = (...args) => {
          return drawFn(...args)
        }
      }
    }
  }

}


class Buffer {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.pixels = new PackedArray(this.width * this.height)
  }

  setChar(x, y, char) {
    if ( !this.isInBounds(x, y) ) { return }
    this.pixels.setChar(this.getBufferIndex(x, y), char)
  }

  getChar(x, y) {
    if ( !this.isInBounds(x, y) ) { return "."}
    return this.pixels.getChar(this.getBufferIndex(x, y))
  }

  clear() {
    this.pixels.resetValues()
  }

  isInBounds(x, y) {
    return y < this.height && y >= 0
    && x < this.width && x >= 0
  }

  getBufferIndex(x, y) {
    return x + y * this.width
  }




}

class Drawer {

  constructor(buffer) { 

    this.buffer = buffer
    this.width = this.buffer.width
    this.height = this.buffer.height

  }  

  // PUBLIC METHODS

  drawPixel(x, y, char) {
    // around 0.0033 ms per call

    x = x | 0;
    y = y | 0;

    if (!this.buffer.isInBounds(x, y)) return;

    this.buffer.setChar(x, y, char)
  }

  drawRect(x, y, rectWidth, rectHeight, char) {
      // around 0.10 ms per call

      x = x | 0;
      y = y | 0;

      if (!this.buffer.isInBounds(x, y)) return;

      const xEnd = Math.min(this.width, x + rectWidth)
      const yEnd = Math.min(this.height, y + rectHeight)

      for (let yi = y; yi < yEnd; yi++) {
        for (let xi = x; xi < xEnd; xi++) { 
            this.buffer.setChar(xi, yi, char)
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
          this.buffer.setChar(x, y, char)
        }
      }
    }
  }


  clearRect(x, y, width, height) {
    this.drawRect(x, y, width, height, ".")
  }

  clearCanvas() {
    this.buffer.clear()
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
      this.buffer.setChar(x0, y0, char)

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


}

