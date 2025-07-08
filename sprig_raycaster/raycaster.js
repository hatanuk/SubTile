
//
class Ray {
  constructor(x, y, radians, isVertical) {
    this.x = x
    this.y = y
    this.radians = radians
    this.length = 9999
    this.isVertical = isVertical
  }

  drawRay(renderer) {
    let color = this.isVertical ? "7" : "8"

     renderer.drawLine(this.x, 
                      this.y, 
                      this.x + Math.cos(this.radians) * this.length, 
                      this.y - Math.sin(this.radians) * this.length, 
                      color)
  

    if (this.hitX && this.hitY) {
      console.log(this.hitX, this.hitY)
      renderer.drawCircle(this.hitX, this.hitY, 2, color)
    }
  }
}


class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.theta = 0
    this.lineLength = 10
    this.size = 5
    this.speed = 1
  }

  drawPlayer(renderer) {
    renderer.drawRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size, "3")

   
    renderer.drawLine(this.x, 
                      this.y, 
                      this.x + Math.cos(this.theta) * this.lineLength, 
                      this.y - Math.sin(this.theta) * this.lineLength, 
                      "6")
  }
  
}

class RaycastRenderer {

  
  constructor(pixelRenderer) {

      // actual size and location of rendered map

      this.mapRender = {
        x : 0,
        y : 0,
        width: 128,
        height: 128
      }

      this.map = [
        [1,1,1,1,1,1,1,1],
        [1,-1,1,0,0,0,0,1],
        [1,0,1,1,1,1,0,1],
        [1,0,0,0,1,0,0,1],
        [1,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1],
        ]

      this.mapSizeX = this.map[0].length
      this.mapSizeY = this.map.length

      this.tileSize = Math.floor(this.mapRender.width / this.mapSizeX); 

      this.rend = pixelRenderer
    
      let {px, py} = this.getPlayerSpawnCoordinate(this.map)
      console.log(px)
      this.player = new Player(px, py)

      // Input management
      this.keysDown = {}
      this.setupInput()

      // Initialisation
      this.drawMap()
      this.tick()
  }

  getPlayerSpawnCoordinate(map) {
  for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
    const row = map[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const tile = row[colIndex];

      if (tile === -1) {
        return {
          px: colIndex * this.tileSize + this.mapRender.x + this.tileSize / 2,
          py: rowIndex * this.tileSize + this.mapRender.y + this.tileSize / 2
        };
      }
    }
  }

    
  // Resort to a default spawnpoint of tx: 1, ty: 1
  return {
    px: this.tileSize + this.mapRender.x,
    py: this.tileSize + this.mapRender.y
  };
}

  drawMap() {

    const {tileSize, mapSizeY, mapSizeX, mapRender, map, player, rend} = this

    rend.clearRect(mapRender)
    
     for (var row = 0; row < mapSizeY; row++) {
            for (var col = 0; col < mapSizeX; col++) {
                const cell = map[row][col]
                if (cell > 0) {
                    rend.drawRect(col * tileSize + mapRender.x, row * tileSize + mapRender.y,  tileSize - 1, tileSize - 1, "5")
                }
            }
        }
    addText(`rad: ${player.theta.toFixed(2)}`, {x: 0, y: 0, color: "4" })
    player.drawPlayer(rend)
  }

  clampRadians(r) {
        if (r > Math.PI * 2) {
            r -= Math.PI * 2
        } 
        
        if (r < 0) {
            r += Math.PI * 2
        }

        return r
    }

  getHorizontalIntersection(ray) {

        ray.isVertical = false

        const theta = this.clampRadians(ray.radians)
        const facingUp = theta < Math.PI
        let {tx, ty} = this.getWallTileAtPos(this.player.x, this.player.y)
        
        const yStep = facingUp ? -this.tileSize : this.tileSize
        const xStep = - (yStep * 1 / Math.tan(theta))
        console.log(yStep, 1 / Math.tan(theta), xStep)

        const firstY = this.tileSize * ty + (facingUp ? 0 : this.tileSize)
        const adj = (this.player.y - firstY) * (1 / Math.tan(theta))
        const firstX = this.player.x + adj

        let wall;
        let nextX = firstX;
        let nextY = firstY;

        while (!wall) {
            const nextTile = this.getWallTileAtPos(nextX, nextY)
            const intercept_tx = nextTile.tx
            const intercept_ty = nextTile.ty - (facingUp ? 1 : 0)

            if (!this.isInBounds(intercept_tx, intercept_ty)) {
                break
            }

            wall = this.map[intercept_ty][intercept_tx]

            if (!wall) {
                // Empty space. Continues the raycast.
                nextX += xStep
                nextY += yStep
            }

            ray.hitX = nextX
            ray.hitY = nextY

            const dx = nextX - this.player.x
            const dy = nextY - this.player.y

            ray.length = Math.sqrt(dx*dx + dy*dy)
        }
        return ray

    }

  getVerticalIntersection(ray) {

        ray.isVertical = true

        const theta = this.clampRadians(ray.radians)
        const facingRight = theta <= 0.5 * Math.PI || theta >= 1.5 * Math.PI
        let {tx, ty} = this.getWallTileAtPos(this.player.x, this.player.y)

        const xStep = facingRight ? this.tileSize : -this.tileSize
        const yStep = - (xStep * Math.tan(theta))
        console.log(xStep, Math.tan(theta), yStep)

        const firstX = this.tileSize * tx + (facingRight ? this.tileSize : 0)
        const opp = (this.player.x - firstX) * Math.tan(theta) // positive in upper quadrants, negative in lower
        const firstY = this.player.y + opp

        let wall;
        let nextX = firstX;
        let nextY = firstY;

        while (!wall) {
            //console.log(`trying to get wall tile at ${nextX}, ${nextY}`)
            const nextTile = this.getWallTileAtPos(nextX, nextY)
            const intercept_tx = nextTile.tx - (facingRight ? 0 : 1)
            const intercept_ty = nextTile.ty

            if (!this.isInBounds(intercept_tx, intercept_ty)) {
                break
            }

            wall = this.map[intercept_ty][intercept_tx]

            if (!wall) {
                // Empty space. Continues the raycast.
                nextX += xStep
                nextY += yStep
            }

            ray.hitX = nextX
            ray.hitY = nextY

            const dx = nextX - this.player.x
            const dy = nextY - this.player.y

            ray.length = Math.sqrt(dx*dx + dy*dy)
        }
        return ray
    }

  castRays() {

        const numRays = 30
        const fov = Math.PI / 2

        const offset = fov / numRays

        const start_theta = this.player.theta + fov / 2

        let theta = start_theta

        for (let i = 0; i < numRays; i++) {
            let rayV = this.getVerticalIntersection(new Ray(this.player.x, this.player.y, theta, true))
            let rayH = this.getHorizontalIntersection(new Ray(this.player.x, this.player.y, theta, false))
            let ray = rayV.length < rayH.length ? rayV : rayH
            
            ray.drawRay(this.rend)
            theta -= offset
        }

  }



  setupInput() {
    const keys = ['w', 'a', 's', 'd', 'i', 'j', 'k', 'l'];
  
    keys.forEach(key => {
      onInput(key, () => {
        this.keysDown[key] = true;
      });
    });
  
    afterInput(() => {
      setTimeout(() => { for (let key in this.keysDown) {
        this.keysDown[key] = false;
      }}, 500)
    });
  }

  isInBounds(tx, ty) {
    return tx >= 0 && tx < this.mapSizeX && ty >= 0 && ty < this.mapSizeY
  }

  getWallTileAtPos(x, y) {
        const tx = Math.floor((x - this.mapRender.x) / this.tileSize);
        const ty = Math.floor((y - this.mapRender.y) / this.tileSize);
        return {tx, ty, type: this.isInBounds(tx, ty) ? this.map[ty][tx] : 0} 
    }
  
  tick() {
        const deltaX = Math.cos(this.player.theta) * this.player.speed
        const deltaY = - Math.sin(this.player.theta) * this.player.speed
        let newPosX = this.player.x
        let newPosY = this.player.y

        if (this.keysDown['w']) {
        newPosX = this.player.x + deltaX
        newPosY = this.player.y + deltaY
        }
        else if (this.keysDown['s']) {
        newPosX = this.player.x - deltaX
        newPosY = this.player.y - deltaY
        }

        if (this.getWallTileAtPos(newPosX, this.player.y).type <= 0) {
        this.player.x = newPosX
        }
        if (this.getWallTileAtPos(this.player.x, newPosY).type <= 0) {
        this.player.y = newPosY
        }

        if (this.keysDown['a']) {
        this.player.theta = this.clampRadians(this.player.theta + 0.2)
        }
        else if (this.keysDown['d']) {
        this.player.theta = this.clampRadians(this.player.theta - 0.2)
        }

        this.drawMap()
        this.castRays()
        this.rend.renderFrame()
        setTimeout(() => { this.tick() }, 100)
  }
}







