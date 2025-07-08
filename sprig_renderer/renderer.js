// todo:
// implement .clear() method to clear frame before drawing

// ARBITRARY PIXEL RENDERER
// bottleneck checks:
// - conversion of tile array to bitmap strings

class PixelRenderer {

  /*
  Allows tile-based renderers (such as Sprig) to display pixels at arbitrary coordinates 
  by dynamically updating the legend.

  Usage: 
  setPixel(x, y, char) - draws a pixel at a given coordinate
  renderFrame(x, y, char) - refreshes the legend to apply changes

  */ 
  constructor(tileSize, screenWidth, screenHeight) { 
    this.tileSize = tileSize
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight

    this.tiles = Array.from({ length: this.screenHeight }, () =>
    Array.from({ length: this.screenWidth }, () =>
        Array.from({ length: this.tileSize }, () => Array.from({ length: this.tileSize }, () => '.'))))
    
    this.renderMap = this.tiles.map( (row, rowIndex) => 
    row.map( (tile, colIndex) => 
      this._mapToBitmapKey(rowIndex, colIndex)).join("")
                         ).join("\n")

    // Sets the legend, map, and renders the first frame
    this._init()

  }  

  // PUBLIC METHODS

  renderFrame() {
    // around 2.3 ms per call
  
  let newLegend = []
  function updateLegend(bitmapKey, bitmap) {
    newLegend.push([bitmapKey, bitmap])
  }
  
  this.tiles.forEach( (row, rowIndex) => row.forEach((tile, colIndex) => 
    updateLegend(this._mapToBitmapKey(rowIndex, colIndex), this._tileArrayToBitmap(tile))))

  setLegend(...newLegend)
  
}

  drawPixel(x, y, char) {
    // around 0.0033 ms per call

    x = x | 0;
    y = y | 0;
    
    let {tx, ty} = this._getTileCoordinate(x, y)
    this.tiles[ty][tx][y - ty * this.tileSize][x - tx * this.tileSize] = char;
  }

  drawRect(x, y, rectWidth, rectHeight, char) {
      // around 0.10 ms per call

      x = x | 0;
      y = y | 0;

      rectWidth = Math.min(this.screenWidth * this.tileSize, x + rectWidth)
      rectHeight = Math.min(this.screenHeight * this.tileSize, y + rectHeight)


      for (let xi = x; xi < rectWidth; xi++) {
        for (let yi = y; yi < rectHeight; yi++) { 
            let {tx, ty} = this._getTileCoordinate(xi, yi)
            this.tiles[ty][tx][yi - ty * this.tileSize][xi - tx * this.tileSize] = char;
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
    const xEnd = Math.min(this.screenWidth * this.tileSize, cx + radius);
    const yEnd = Math.min(this.screenHeight * this.tileSize, cy + radius);
  
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx + dy * dy) <= radiusSq) {
          const { tx, ty } = this._getTileCoordinate(x, y);
          this.tiles[ty][tx][y - ty * this.tileSize][x - tx * this.tileSize] = char;
        }
      }
    }
  }


  clearRect({x, y, width, height}) {
    this.drawRect(x, y, width, height, "2")
  }


  drawLine(x0, y0, x1, y1, char, width = 1) {

    x0 = x0 | 0
    y0 = y0 | 0
    x1 = x1 | 0
    y1 = y1 | 0

    // around 0.05 ms but depends heavily on width and length
    
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
  
    const half = Math.floor(width / 2);
  
    while (true) {
      for (let ox = -half; ox <= half; ox++) {
        for (let oy = -half; oy <= half; oy++) {
          const px = x0 + ox;
          const py = y0 + oy;
          let { tx, ty } = this._getTileCoordinate(px, py);
          const localX = px - tx * this.tileSize;
          const localY = py - ty * this.tileSize;
          if (
            tx >= 0 && tx < this.tiles[0].length &&
            ty >= 0 && ty < this.tiles.length &&
            localX >= 0 && localX < this.tileSize &&
            localY >= 0 && localY < this.tileSize
          ) {
            this.tiles[ty][tx][localY][localX] = char;
          }
        }
      }
  
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
}
  // PRIVATE METHODS


  _getTileCoordinate(x, y) {
    let tx = Math.floor(x / this.tileSize)
    let ty = Math.floor(y / this.tileSize)
    return {tx, ty}
  }

  _init() {
    this.renderFrame()
    setMap(this.renderMap)
  }

  _tileArrayToBitmap(tile) {
    return tile.map(row => row.join('')).join('\n');
  }

  _mapToBitmapKey(rowIndex, colIndex) {
    return String.fromCharCode(47 + rowIndex * 10 + colIndex);
  }
}


class Metrics {

    testEfficiency(fn, ...args) {
        const start = performance.now();
        fn(...args);
        const end = performance.now();
        console.log(`Execution time: ${(end - start).toFixed(4)} ms`);
}

    testMethodEfficiency(obj, methodName, ...args) {
        let trials = 30
        let sum = 0

        for (let i = 0; i < trials; i++) {
            const start = performance.now();
            obj[methodName](...args);
            const end = performance.now();
            sum += (end - start)
        }
        console.log(`${methodName} executed in ${(sum / trials).toFixed(4)} ms`)
    }
}


let renderer = new PixelRenderer(16, 10, 8)
