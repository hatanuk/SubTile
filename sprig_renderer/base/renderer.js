class PixelRenderer {

  /*
  Allows tile-based renderers (such as Sprig) to display pixels at arbitrary coordinates 
  by dynamically updating the legend.

  Usage: 
  renderFrame(x, y, char) - refreshes the legend to apply changes
  addCanvas(x, y, canvas, scaleX=1, scaleY=1) - Adds a canvas to render, with the last added canvas being drawn on top.
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

  addCanvas(x, y, canvas, scaleX=1, scaleY=1) {
    canvas.xOffset = x
    canvas.yOffset = y
    canvas.scaleX = scaleX
    canvas.scaleY = scaleY
    canvas.updateTransformMatrix()
    this.canvases.push(canvas)
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
          this._renderPixel(coord.x, coord.y, coord.char)
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

   _getBufferIndex(x, y) {
    return x + y * (this.screenTileWidth * this.tileSize)
  }

  
  _renderPixel(x, y, char) {
    this.buffer.setChar(this._getBufferIndex(x, y), char)
  }

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
}