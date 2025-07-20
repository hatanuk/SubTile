// Adapted from https://github.com/app-affairs-GmbH/js-raycaster

class HUD {

  constructor(HUDCanvas) {
    this.canvas = HUDCanvas
    this.faceWidth = 24
    this.faceHeight = 34

    this.canvas.drawRect(0, 0, this.canvas.width, this.canvas.height, "7")

    this.logoSprite = new Sprite(logoRGB, 54,  23)
    this.canvas.drawSprite(102, 7, this.logoSprite)


    this.canvas.drawRect(0, 0, this.canvas.width, 2, "5")
    this.canvas.drawRect(this.canvas.width / 2 - this.faceWidth / 2 - 2, 0, this.faceWidth + 4, this.canvas.height, "5")

    this.faceFrontSprite = new Sprite(faceFrontRGB, this.faceWidth, this.faceHeight)
    this.faceLeftSprite = new Sprite(faceLeftRGB, this.faceWidth, this.faceHeight)
    this.faceRightSprite = new Sprite(faceRightRGB, this.faceWidth, this.faceHeight)

  
    this.onIdle()

  }

  onRightInput() {
    this.canvas.drawSprite(this.canvas.width / 2 - this.faceWidth / 2, 
                           2, this.faceRightSprite)
  }

  onLeftInput() {
     this.canvas.drawSprite(this.canvas.width / 2 - this.faceWidth / 2, 
                           2, this.faceLeftSprite)
  }

  onIdle() {
     this.canvas.drawSprite(this.canvas.width / 2 - this.faceWidth / 2, 
                           2, this.faceFrontSprite)
  }



  
}


class Ray {
  constructor(x, y, radians, isVertical) {
    this.x = x
    this.y = y
    this.radians = radians
    this.length = 9999
    this.isVertical = isVertical
  }

  drawRay(mapCanvas) {
    let color = this.isVertical ? "7" : "8"

     mapCanvas.drawLine(this.x, 
                      this.y, 
                      this.x + Math.cos(this.radians) * this.length, 
                      this.y - Math.sin(this.radians) * this.length, 
                      color)
  

    if (this.hitX && this.hitY) {
      mapCanvas.drawCircle(this.hitX, this.hitY, 1, "3")
    }
  }
}


class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.theta = 3* Math.PI/2
    this.lineLength = 10
    this.size = 4
    this.speed = 0.5
  }

  drawPlayer(mapCanvas) {
    mapCanvas.drawRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size, "3")

   
    mapCanvas.drawLine(this.x, 
                      this.y, 
                      this.x + Math.cos(this.theta) * this.lineLength, 
                      this.y - Math.sin(this.theta) * this.lineLength, 
                      "6")
  }
  
}

class RaycastRenderer {
  
  constructor(pixelRenderer, mapCanvas, viewCanvas, HUDCanvas) {


      this.mapCanvas = mapCanvas
      this.viewCanvas = viewCanvas
      this.HUDCanvas = HUDCanvas

      this.rend = pixelRenderer

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

      this.tileSize = Math.floor(this.mapCanvas.width / this.mapSizeX); 
    
      let {px, py} = this.getPlayerSpawnCoordinate(this.map)
      this.player = new Player(px, py)
      this.velocity = 0

      // Input management
      this.keysDown = {}
      this.setupInput()

      this.raysArray = []

      // Initialisation
      this.tick()
  }

  getPlayerSpawnCoordinate(map) {
  for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
    const row = map[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const tile = row[colIndex];

      if (tile === -1) {
        return {
          px: colIndex * this.tileSize + this.tileSize / 2,
          py: rowIndex * this.tileSize + this.tileSize / 2
        };
      }
    }
  }

    
  // Resort to a default spawnpoint of tx: 1, ty: 1
  return {
    px: this.tileSize,
    py: this.tileSize
  };
}


  drawView() {
    this.viewCanvas.clearCanvas()
    this.viewCanvas.drawRect(0, 0, 10, 10, "2")

    var xPos = 0;
    var xOffset = this.viewCanvas.width / this.raysArray.length
    var yCenter = this.viewCanvas.height / 2


    for (let ray of this.raysArray) {

        const distance = this.fixFishEye(ray.length, ray.radians)

        const wallHeight = (4 / distance) * this.viewCanvas.height
        
        const yPosTop = Math.max(yCenter - wallHeight / 2, 0)
        const yPosBot = Math.min(yCenter + wallHeight / 2, this.viewCanvas.height)

        console.log(distance)
        //console.log(xPos, yPosTop, xOffset, wallHeight)
        
        this.viewCanvas.drawRect(xPos, yPosTop, xOffset, wallHeight, "1")

        this.viewCanvas.drawRect(xPos, yPosBot, xOffset, this.viewCanvas.height - yPosBot, "0")

        xPos += xOffset
    }

}

  drawMap() {

    const {tileSize, mapSizeY, mapSizeX, mapCanvas, map, player, rend} = this
    
     for (var row = 0; row < mapSizeY; row++) {
            for (var col = 0; col < mapSizeX; col++) {
                const cell = map[row][col]
                if (cell > 0) {
                    mapCanvas.drawRect(col * tileSize, row * tileSize,  tileSize - 1, tileSize - 1, "5")
                }
            }
        }


    player.drawPlayer(mapCanvas)
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
     

        const firstX = this.tileSize * tx + (facingRight ? this.tileSize : 0)
        const opp = (this.player.x - firstX) * Math.tan(theta) // positive in upper quadrants, negative in lower
        const firstY = this.player.y + opp

        let wall;
        let nextX = firstX;
        let nextY = firstY;

        while (!wall) {
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
        this.raysArray = []
        const numRays = 100
        const fov = Math.PI / 2

        const offset = fov / numRays

        const start_theta = this.player.theta + fov / 2

        let theta = start_theta

        for (let i = 0; i < numRays; i += 1) {
            let rayV = this.getVerticalIntersection(new Ray(this.player.x, this.player.y, theta, true))
            let rayH = this.getHorizontalIntersection(new Ray(this.player.x, this.player.y, theta, false))
            let ray = rayV.length < rayH.length ? rayV : rayH

            this.raysArray.push(ray)
            if (i % 5 == 0) {
              ray.drawRay(this.mapCanvas)
            }
            theta -= offset
        }

  }



  setupInput() {
    const keys = ['w', 'a', 's', 'd', 'i', 'j', 'k', 'l'];
  
    keys.forEach(key => {

      if (key === "a") {
        onInput(key, this.onLeft.bind(this))
      } else if (key === "d") {
        onInput(key, this.onRight.bind(this))
    } else if (key === "w") {
        onInput(key, this.onForward.bind(this))
    } else if (key === "s") {
        onInput(key, this.onBackward.bind(this))
      }
    })

  
    // afterInput(() => {
    //   setTimeout(() => { for (let key in this.keysDown) {
    //    this.keysDown[key] = false;
    //   }}, 10)
    // });
  }

  onForward() {
    this.velocity = this.player.speed
    let newPosX = this.player.x + this.deltaX
    let newPosY = this.player.y + this.deltaY
    this.attemptPlayerMove(newPosX, newPosY)
    
  }

  onBackward() {
    this.velocity = -this.player.speed
    let newPosX = this.player.x - this.deltaX
    let newPosY = this.player.y - this.deltaY
    this.attemptPlayerMove(newPosX, newPosY)
    
  }

  attemptPlayerMove(newPosX, newPosY) {
    if (this.getWallTileAtPos(newPosX, this.player.y).type <= 0) {
        this.player.x = newPosX
        }
    if (this.getWallTileAtPos(this.player.x, newPosY).type <= 0) {
        this.player.y = newPosY
        }
    
  }

  onLeft() {
    
    this.turnTarget = this.clampRadians(this.player.theta + Math.PI / 6)
  }

  onRight() {
    this.turnTarget = this.clampRadians(this.player.theta - Math.PI / 6)
  }
  
  isInBounds(tx, ty) {
    return tx >= 0 && tx < this.mapSizeX && ty >= 0 && ty < this.mapSizeY
  }

  getWallTileAtPos(x, y) {
        const tx = Math.floor(x / this.tileSize);
        const ty = Math.floor(y / this.tileSize);
        return {tx, ty, type: this.isInBounds(tx, ty) ? this.map[ty][tx] : 0} 
    }


  smoothRotation() {
    this.turnSpeed = 0.15
    
    if (this.turnTarget != null) {

      const diff = this.turnTarget - this.player.theta
      const angle = Math.atan2(Math.sin(diff), Math.cos(diff)) // shortest angle
    
      if (Math.abs(angle) < this.turnSpeed) {
        this.HUDCanvas.onIdle()
        this.player.theta = this.turnTarget
        this.turnTarget = null
      } else {
        if (angle < 0) {this.HUDCanvas.onRightInput()} else {this.HUDCanvas.onLeftInput()}
        this.player.theta = this.clampRadians(this.player.theta + Math.sign(angle) * this.turnSpeed)
      }
    }
  }

  fixFishEye(distance, radians) {
        const diff = radians - this.player.theta
        return distance * Math.cos(diff)
        
    }
  
  tick() {
    
        this.deltaX = Math.cos(this.player.theta) * this.velocity
        this.deltaY = - Math.sin(this.player.theta) * this.velocity
        if (this.velocity > 0) {
          this.velocity = Math.max(0, this.velocity - 0.1)
        } else if (this.velocity < 0) {
          this.velocity = Math.min(0, this.velocity + 0.1)
        }

        this.smoothRotation()

        let newPosX = this.player.x + this.deltaX
        let newPosY = this.player.y + this.deltaY
        this.attemptPlayerMove(newPosX, newPosY)
    
        this.mapCanvas.clearCanvas()
        this.castRays()
        this.drawMap()
        this.viewCanvas.clearCanvas()
        this.drawView()
        this.rend.renderFrame()
    
        setTimeout(() => { this.tick() }, 100)
  }
}



let renderer = new SubTileRenderer(160, 128)

let mapCanvas = new Canvas(40, 40)
let viewCanvas = new Canvas(160, 128 - 34)
let faceHUDCanvas = new Canvas(160, 34)
let gameHUD = new HUD(faceHUDCanvas)


renderer.addCanvas(0, 0, viewCanvas)
renderer.addCanvas(160/2 - faceHUDCanvas.width / 2, 
                   128 - faceHUDCanvas.height, faceHUDCanvas)
renderer.addCanvas(12, 128-41*0.8 + 2, mapCanvas, 1, 0.8)


let raycasterRend = new RaycastRenderer(renderer, mapCanvas, viewCanvas, gameHUD)


