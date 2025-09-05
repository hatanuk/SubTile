class SubTileRenderer {

  constructor(screenTileWidth = 10, screenTileHeight = 8) {

    ///
    this.TILESIZE = 16
    this.screenTileHeight = screenTileHeight
    this.screenTileWidth = screenTileWidth
    this.pixelHeight =this.screenTileHeight * this.TILESIZE
    this.pixelWidth = this.screenTileWidth * this.TILESIZE

    // contains legend indexes of tiles which need their bitmap redrawn
    this.dirtyBucket = new Set()

    // determines order of surfaces
    this.surfaces = []

    // main frame buffer 
    this.buffer = new Buffer(this.screenTileWidth * this.TILESIZE, this.screenTileHeight * this.TILESIZE)

    // creates a bitmap representing each tile, mapped to a unique character
    this.tileBitmap = this._createTileBitmap()
    this.legend = this._createLegend() 


    setLegend(...this.legend)
    setMap(this.tileBitmap)
    

  }


  beginFrame() { 
    this.clearDirtyBucket()
  }


  endFrame() {

    // draws mapped pixels from each surface onto screen buffer (forward pass)
    this.surfaces.forEach(
      surface => {

        if (surface.isTransformed()) {

          // perform affine transformation mapping for each pixel
          // much less efficient then blitting, it is recommended only offset transformations are used
          surface.getTransformedPixels().forEach(
          coord => {
            this._renderPixel(coord.x, coord.y, coord.char)
          })
        } else {
          // if no transformation needed, blit directly
          blit(surface.buffer, this.buffer, 
            surface.width, surface.height, 
            surface.T.b0, surface.T.b1)

        }
          // mark tiles touched by surface as dirty
        for (let x = surface.T.b0; x < surface.T.b0 + surface.width; x += this.TILESIZE ) {
          for (let y = surface.T.b1; y < surface.T.b1 + surface.height; y += this.TILESIZE) {
            if (x < 0 || x >= this.pixelWidth || y < 0 || y >= this.pixelHeight) {continue}
            this.markDirty(this._coordToTile(x, y))
          }
        }
        
      }

      )
    
    // convert each tile (from buffer) to a bitmap and add it to the legend
     for (const index of this.dirtyBucket) {
      const {tx, ty} = this._legendIndexToTile(index)
      // update the dirty tile
      this.legend[index][1] = this._tileToBitmap(tx, ty)
    }

    setLegend(...this.legend)
    
  }

  // DIRTY TILE MANAGEMENT

  markDirty({tx, ty}) { 
    if (tx < 0 || ty < 0 || tx >= this.screenTileWidth || ty >= this.screenTileHeight) return
    this.dirtyBucket.add(this._getLegendIndex(tx, ty))
  }

  clearDirtyBucket() { this.dirtyBucket.clear()}

  isDirty({tx, ty}) {return this.dirtyBucket.has(this._getLegendIndex(tx, ty))}


  // SURFACE MANAGEMENT

  addSurface(surface, x=0, y=0) {
    surface.T.b0 = x
    surface.T.b1 = y

    if (this.surfaces.includes(surface)) {
      this.removeSurface(surface)
      this.addSurface(surface, x, y)
    } else {
      this.surfaces.push(surface)
    }
  }

  removeSurface(surface) {
    this.surfaces = this.surfaces.filter(currentSurface => currentSurface !== surface)
  }

  applyTransformation(surface, {scaleX = 1, scaleY = 1, xOffset, yOffset} = {}) {
    
    xOffset = xOffset ?? surface.T.b0
    yOffset = yOffset ?? surface.T.b1
     // affine transformation matrix
    surface.applyTransformation( new Transform2D(
        scaleX, 0,
        0, scaleY,
        xOffset, yOffset
    )
  )
  }

  removeTransformations(surface) {
    surface.resetTransformations()
  }


  // PRIVATE METHODS

  _getBufferIndex(x, y) {
    return x + y * (this.screenTileWidth * this.TILESIZE)
  }

  _getLegendIndex(tx, ty) {
    return tx + ty * this.screenTileWidth
  }

  _coordToTile(x, y) {
    return {tx: x >> 4, ty: y >> 4}
  }


  _renderPixel(x, y, char) {
    this.buffer.setChar(x, y, char)
    this.markDirty(this._coordToTile(x, y));
  }

  _tileToBitmapKey(tx, ty) {
    return String.fromCharCode(47 + ty * this.screenTileWidth + tx)
  }

  _legendIndexToTile(index) {
    const w = this.screenTileWidth
    const ty = (index / w) | 0
    const tx = index % w
    return { tx, ty }
  }

  _tileToBitmap(tx, ty) {
    let bitmapRows = new Array(this.TILESIZE)
    const startX = tx * this.TILESIZE
    const startY = ty * this.TILESIZE

    for (let y = 0; y < this.TILESIZE; y++) {
      let row = new Array(this.TILESIZE)
      for (let x = 0; x < this.TILESIZE; x++) {
        row[x] = (this.buffer.getChar(startX + x, startY + y))
      }
      bitmapRows[y] = row.join("")
    }

    return bitmapRows.join("\n")

  }

  _createTileBitmap() {
    let rows = new Array(this.screenTileHeight)
    for (let ty = 0; ty < this.screenTileHeight; ty++) {
      let row = new Array(this.screenTileWidth)
      for (let tx = 0; tx < this.screenTileWidth; tx++) {
       
        row[tx] = (this._tileToBitmapKey(tx, ty))
      }
      rows[ty] = row.join("")
      
    }
    return rows.join("\n")
  }

  _createLegend() {

    const legend = new Array(this.screenTileHeight * this.screenTileWidth)
    const emptyBitmap = (".".repeat(16) + "\n").repeat(16)

    for (let ty = 0; ty < this.screenTileHeight; ty++) {
      for (let tx = 0; tx < this.screenTileWidth; tx++) {
        const bitmapKey = this._tileToBitmapKey(tx, ty)
        legend[this._getLegendIndex(tx, ty)] = [bitmapKey, emptyBitmap]
      }
    }
    return legend
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
