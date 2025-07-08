class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.theta = 0
    this.lineLength = 40
    this.size = 20
    this.speed = 5
  }

  drawPlayer(mapContext) {
    mapContext.save()
    mapContext.fillStyle = "white"
    mapContext.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)

    mapContext.beginPath()
    mapContext.moveTo(this.x, this.y)
    mapContext.strokeStyle = "white"
    mapContext.lineTo(
      this.x + Math.cos(this.theta) * this.lineLength,
      this.y + - Math.sin(this.theta) * this.lineLength
    )
    mapContext.stroke()
    mapContext.restore()
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

  drawRay(mapContext) {
    mapContext.save()
    mapContext.beginPath()
    mapContext.moveTo(this.x, this.y)
    mapContext.strokeStyle = this.isVertical ? "#darkgreen" : "#b0c700"
    mapContext.lineTo(
      this.x + Math.cos(this.radians) * this.length,
      this.y - Math.sin(this.radians) * this.length
    )
    mapContext.stroke()

    if (this.hitX && this.hitY) {
      mapContext.beginPath()
      mapContext.fillStyle = this.isVertical ? "#darkgreen" : "#b0c700"
      mapContext.arc(this.hitX, this.hitY, 4, 0, 2 * Math.PI)
      mapContext.fill()
    }
    mapContext.restore()
  }
}


class Raycaster {
    constructor(mapCanvas, gameCanvas) {
        this.mapCanvas = mapCanvas
        this.gameCanvas = gameCanvas
        this.raysArray = []
        this.init()
    }

   init() {
        this.map = [
        [1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,0,1],
        [1,0,0,0,1,0,0,1],
        [1,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1],
        ]

        this.tileSize = 64
        this.mapScale = 0.5
        this.mapSizeX = this.map[0].length
        this.mapSizeY = this.map.length

        // MAP WINDOW

        this.mapContext = this.mapCanvas.getContext("2d")
        this.mapContext.width = this.tileSize * this.mapSizeX
        this.mapContext.height = this.tileSize * this.mapSizeY
        this.mapCanvas.width = this.mapContext.width * this.mapScale
        this.mapCanvas.height = this.mapContext.height * this.mapScale
        this.mapContext.scale(this.mapScale, this.mapScale)

        // GAME WINDOW

        this.gameContext = this.gameCanvas.getContext("2d")
        this.gameContext.width = 640
        this.gameContext.height = 480
        this.gameCanvas.width = this.gameContext.width
        this.gameCanvas.height = this.gameContext.height




        this.player = new Player(2.5 * this.tileSize, 5.5 * this.tileSize)

        this.keysDown = {}
        document.addEventListener('keydown', (evt) => {
        this.keysDown[evt.key] = true
        })
        document.addEventListener('keyup', (evt) => {
        delete this.keysDown[evt.key]
        })
        window.addEventListener("blur", (evt) => {
        this.keysDown = {}
        })

        this.drawMap()
        this.tick()
  }

    isInBounds(tx, ty) {
       return tx >= 0 && tx < this.mapSizeX && ty >= 0 && ty < this.mapSizeY
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

    getWallTileAtPos(x, y) {
        const tx = Math.floor(x / this.tileSize)
        const ty = Math.floor(y / this.tileSize)
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

        if (this.getWallTileAtPos(newPosX, this.player.y).type == 0) {
        this.player.x = newPosX
        }
        if (this.getWallTileAtPos(this.player.x, newPosY).type == 0) {
        this.player.y = newPosY
        }

        if (this.keysDown['a']) {
        this.player.theta = this.clampRadians(this.player.theta + 0.05)
        }
        else if (this.keysDown['d']) {
        this.player.theta = this.clampRadians(this.player.theta - 0.05)
        }

        this.drawMap()
        this.castRays()
        this.drawGame()
        setTimeout(() => { this.tick() }, 10)
  }

    getVerticalIntersectionAlter(ray) {
    const radians = this.clampRadians(ray.theta)
    const facingRight = radians <= 0.5 * Math.PI || radians >= 1.5 * Math.PI
    const { tx, ty } = this.getWallTileAtPos(this.player.x, this.player.y)
    const firstX = tx * this.tileSize + (facingRight ? this.tileSize : 0)

    const firstY = this.player.y + (firstX - this.player.x) * Math.tan(radians)
    const deltaXPerTile = facingRight ? this.tileSize : -this.tileSize
    const deltaYPerTile = deltaXPerTile * Math.tan(radians)

    let wall
    let nextX = firstX
    let nextY = firstY

    while (!wall) {
      const nextTile = this.getWallTileAtPos(nextX, nextY)
      const nextTileX = nextTile.tx - (facingRight ? 0 : 1)
      const nextTileY = nextTile.ty

      if (!this.isInBounds(nextTileX, nextTileY)) {
        break
      }

      wall = this.map[nextTileY][nextTileX]
      if (!wall) {
        nextX += deltaXPerTile
        nextY += deltaYPerTile
      }

      ray.hitX = nextX
      ray.hitY = nextY

      const deltaX = nextX - this.player.x
      const deltaY = nextY - this.player.y
      ray.length = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
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
            //console.log(`trying to get wall tile at ${nextX}, ${nextY}`)
            const nextTile = this.getWallTileAtPos(nextX, nextY)
            const intercept_tx = nextTile.tx
            const intercept_ty = nextTile.ty - (facingUp ? 1 : 0)

            if (!this.isInBounds(intercept_tx, intercept_ty)) {
                break
            }

            wall = this.map[intercept_ty][intercept_tx]

            if (!wall) {
                //console.log("empty")
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

        const numRays = 200
        const fov = Math.PI / 2

        const offset = fov / numRays

        const start_theta = this.player.theta + fov / 2

        let theta = start_theta

        for (let i = 0; i < numRays; i++) {
            let rayV = this.getVerticalIntersection(new Ray(this.player.x, this.player.y, theta, true))
            let rayH = this.getHorizontalIntersection(new Ray(this.player.x, this.player.y, theta, false))
            let ray = rayV.length < rayH.length ? rayV : rayH
            this.raysArray.push(ray)
            ray.drawRay(this.mapContext)
            theta -= offset
        }

    }

    highlightCell(tx, ty) {
        this.mapContext.save()
        this.mapContext.fillStyle = "#333333"
        this.mapContext.fillRect(tx * this.tileSize, ty * this.tileSize,  this.tileSize - 1, this.tileSize - 1)
    }

    drawMap() {
        this.mapContext.save()
        this.mapContext.clearRect(0, 0, this.mapContext.width / this.mapScale, this.mapContext.height / this.mapScale)
        this.mapContext.fillStyle = "#888888"
        for (var row = 0; row < this.mapSizeY; row++) {
            for (var col = 0; col < this.mapSizeX; col++) {
                const cell = this.map[row][col]

                if (cell > 0) {
                    this.mapContext.fillRect(col * this.tileSize, row * this.tileSize,  this.tileSize - 1, this.tileSize - 1)
                }
            }
        }


        this.mapContext.font = "50px Arial"
        this.mapContext.fillStyle = "white"
        this.mapContext.fillText(`rad: ${this.player.theta.toFixed(2)}`, 30, 50)

        this.mapContext.restore()
        this.player.drawPlayer(this.mapContext)
    }

    fixFishEye(distance, radians) {
        const diff = radians - this.player.theta
         //console.log(diff)
        return distance * Math.cos(radians)
        
    }

    drawGame() {

        this.gameContext.save()
        this.gameContext.clearRect(0, 0, this.gameContext.width, this.gameContext.height)

        var xPos = 0;
        var xOffset = this.gameContext.width / this.raysArray.length
        var yCenter = this.gameContext.height / 2


        for (let ray of this.raysArray) {

            const distance = this.fixFishEye(ray.length, ray.radians)

            const wallHeight = (100 / distance) * this.gameContext.height
            
            const yPosTop = yCenter - wallHeight / 2
            const yPosBot = yCenter + wallHeight / 2
            
            this.gameContext.fillStyle = "blue"
            this.gameContext.fillRect(xPos, yPosTop, xOffset, wallHeight)

            this.gameContext.fillStyle = "#555555"
            this.gameContext.fillRect(xPos, yPosBot, xOffset, this.gameContext.height - yPosBot)


            xPos += xOffset
        }


        this.gameContext.restore()
 
    }
}