// To use SubTile, copy the minified code below into your Sprig file.
// Refer to https://github.com/hatanuk/SubTile for usage details 
 
// Adapted from https://github.com/app-affairs-GmbH/js-raycaster
// A demo for an arbitrary pixel renderer project for Sprig called SubTile. 
// For more documentation and usage details, refer to https://github.com/hatanuk/SubTile

// Code for the raycaster adapted from Steffen-appafairs
// https://github.com/app-affairs-GmbH/js-raycaster

 
class SubTileRenderer{constructor(screenTileWidth=10,screenTileHeight=8){this.TILESIZE=16,this.screenTileHeight=screenTileHeight,this.screenTileWidth=screenTileWidth,this.pixelHeight=this.screenTileHeight*this.TILESIZE,this.pixelWidth=this.screenTileWidth*this.TILESIZE,this.dirtyBucket=new Set,this.surfaces=[],this.buffer=new Buffer(this.screenTileWidth*this.TILESIZE,this.screenTileHeight*this.TILESIZE),this.tileBitmap=this._createTileBitmap(),this.legend=this._createLegend(),setLegend(...this.legend),setMap(this.tileBitmap)}beginFrame(){this.clearDirtyBucket()}endFrame(){this.surfaces.forEach(surface=>this._drawSurface(surface));for(const index of this.dirtyBucket){const{tx:tx,ty:ty}=this._legendIndexToTile(index);this.legend[index][1]=this._tileToBitmap(tx,ty)}setLegend(...this.legend)}clearSurface(surface){surface.buffer.clear(),this._drawSurface(surface,!0)}clearAll(){this.buffer.clear(),this.markAllDirty()}markDirty({tx:tx,ty:ty}){tx<0||ty<0||tx>=this.screenTileWidth||ty>=this.screenTileHeight||this.dirtyBucket.add(this._getLegendIndex(tx,ty))}markAllDirty(){for(let ty=0;ty<this.screenTileHeight;ty++)for(let tx=0;tx<this.screenTileWidth;tx++)this.markDirty({tx:tx,ty:ty})}clearDirtyBucket(){this.dirtyBucket.clear()}isDirty({tx:tx,ty:ty}){return this.dirtyBucket.has(this._getLegendIndex(tx,ty))}addSurface(surface,x=0,y=0){surface.T.b0=x,surface.T.b1=y,this.surfaces.includes(surface)?(this.removeSurface(surface),this.addSurface(surface,x,y)):this.surfaces.push(surface)}removeSurface(surface){this.surfaces=this.surfaces.filter(currentSurface=>currentSurface!==surface)}applyTransformation(surface,{scaleX:scaleX=1,scaleY:scaleY=1,xOffset:xOffset,yOffset:yOffset}={}){xOffset=xOffset??surface.T.b0,yOffset=yOffset??surface.T.b1,surface.applyTransformation(new Transform2D(scaleX,0,0,scaleY,xOffset,yOffset))}removeTransformations(surface){surface.resetTransformations()}_drawSurface(surface,clearing=!1){if(surface.isTransformed())surface.getTransformedPixels(clearing).forEach(coord=>{this._renderPixel(coord.x,coord.y,coord.char)});else{blit(surface.buffer,this.buffer,surface.width,surface.height,surface.T.b0,surface.T.b1);for(let x=surface.T.b0;x<surface.T.b0+surface.width;x+=this.TILESIZE)for(let y=surface.T.b1;y<surface.T.b1+surface.height;y+=this.TILESIZE)x<0||x>=this.pixelWidth||y<0||y>=this.pixelHeight||this.markDirty(this._coordToTile(x,y))}}_getBufferIndex(x,y){return x+y*(this.screenTileWidth*this.TILESIZE)}_getLegendIndex(tx,ty){return tx+ty*this.screenTileWidth}_coordToTile(x,y){return{tx:x>>4,ty:y>>4}}_renderPixel(x,y,char){this.buffer.setChar(x,y,char),this.markDirty(this._coordToTile(x,y))}_tileToBitmapKey(tx,ty){return String.fromCharCode(47+ty*this.screenTileWidth+tx)}_legendIndexToTile(index){const w=this.screenTileWidth;return{tx:index%w,ty:index/w|0}}_tileToBitmap(tx,ty){let bitmapRows=new Array(this.TILESIZE);const startX=tx*this.TILESIZE,startY=ty*this.TILESIZE;for(let y=0;y<this.TILESIZE;y++){let row=new Array(this.TILESIZE);for(let x=0;x<this.TILESIZE;x++)row[x]=this.buffer.getChar(startX+x,startY+y);bitmapRows[y]=row.join("")}return bitmapRows.join("\n")}_createTileBitmap(){let rows=new Array(this.screenTileHeight);for(let ty=0;ty<this.screenTileHeight;ty++){let row=new Array(this.screenTileWidth);for(let tx=0;tx<this.screenTileWidth;tx++)row[tx]=this._tileToBitmapKey(tx,ty);rows[ty]=row.join("")}return rows.join("\n")}_createLegend(){const legend=new Array(this.screenTileHeight*this.screenTileWidth),emptyBitmap=(".".repeat(16)+"\n").repeat(16);for(let ty=0;ty<this.screenTileHeight;ty++)for(let tx=0;tx<this.screenTileWidth;tx++){const bitmapKey=this._tileToBitmapKey(tx,ty);legend[this._getLegendIndex(tx,ty)]=[bitmapKey,emptyBitmap]}return legend}_bindDrawerMethods(){for(const key of Object.getOwnPropertyNames(Drawer.prototype))if("constructor"!==key&&"_"!==key[0]&&"function"==typeof this.drawer[key]){const drawFn=this.drawer[key].bind(this.drawer);this[key]=(...args)=>drawFn(...args)}}}class Surface{constructor(width,height){this.width=width,this.height=height,this.T=new Transform2D(1,0,0,1,0,0),this.buffer=new Buffer(this.width,this.height),this.drawer=new Drawer(this.buffer),this._bindDrawerMethods()}applyTransformation(T){this.T=this.T.multiply(T)}resetTransformations(){this.T=new Transform2D(1,0,0,1,0,0)}rotate(radians){const cosRad=Math.cos(radians),sinRad=Math.sin(radians);this.applyTransformation(new Transform2D(cosRad,-sinRad,sinRad,cosRad,0,0))}shear(shearX=0,shearY=0){this.applyTransformation(new Transform2D(1,shearX,shearY,1,0,0))}scale(scaleX=1,scaleY=1){this.applyTransformation(new Transform2D(scaleX,0,0,scaleY,0,0))}offset(offsetX=0,offsetY=0){this.applyTransformation(new Transform2D(1,0,0,1,offsetX,offsetY))}isTransformed(){return 1!==this.T.T00||1!==this.T.T11||0!==this.T.T01||0!==this.T.T10}getTransformedPixels(clearing=!1){const charFilter=char=>"."!==char;let transformedCoordinates=[];for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++){let char=this.buffer.getChar(x,y);(clearing||charFilter(char))&&transformedCoordinates.push({x:Math.floor(this.T.transformX(x,y)),y:Math.floor(this.T.transformY(x,y)),char:char})}return transformedCoordinates}_bindDrawerMethods(){for(const key of Object.getOwnPropertyNames(Drawer.prototype))if("constructor"!==key&&"_"!==key[0]&&"function"==typeof this.drawer[key]){const drawFn=this.drawer[key].bind(this.drawer);this[key]=(...args)=>drawFn(...args)}}}class Buffer{constructor(width,height){this.width=width,this.height=height,this.pixels=new PackedArray(this.width*this.height)}setChar(x,y,char){this.isInBounds(x,y)&&this.pixels.setChar(this.getBufferIndex(x,y),char)}getChar(x,y){return this.isInBounds(x,y)?this.pixels.getChar(this.getBufferIndex(x,y)):"."}clear(){this.pixels.resetValues()}isInBounds(x,y){return y<this.height&&y>=0&&x<this.width&&x>=0}getBufferIndex(x,y){return x+y*this.width}}class Drawer{constructor(buffer){this.buffer=buffer,this.width=this.buffer.width,this.height=this.buffer.height}drawPixel(x,y,char){x|=0,y|=0,this.buffer.isInBounds(x,y)&&this.buffer.setChar(x,y,char)}drawRect(x,y,rectWidth,rectHeight,char){if(x|=0,y|=0,!this.buffer.isInBounds(x,y))return;const xEnd=Math.min(this.width,x+rectWidth),yEnd=Math.min(this.height,y+rectHeight);for(let yi=y;yi<yEnd;yi++)for(let xi=x;xi<xEnd;xi++)this.buffer.setChar(xi,yi,char)}drawCircle(cx,cy,radius,char){cx|=0,cy|=0;const radiusSq=(radius=Math.max(1,0|radius))*radius,xStart=Math.max(0,cx-radius),yStart=Math.max(0,cy-radius),xEnd=Math.min(this.width,cx+radius+1),yEnd=Math.min(this.height,cy+radius+1);for(let y=yStart;y<yEnd;y++)for(let x=xStart;x<xEnd;x++){const dx=x-cx,dy=y-cy;dx*dx+dy*dy<=radiusSq&&this.buffer.setChar(x,y,char)}}clearRect(x,y,width,height){this.drawRect(x,y,width,height,".")}clearSurface(){this.buffer.clear()}drawLine(x0,y0,x1,y1,char){x0|=0,y0|=0,x1|=0,y1|=0;let dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;for(;this.buffer.setChar(x0,y0,char),x0!==x1||y0!==y1;){let e2=2*err;e2>-dy&&(err-=dy,x0+=sx),e2<dx&&(err+=dx,y0+=sy)}}drawSprite(x,y,sprite){const xEnd=Math.min(sprite.width+x,this.width),yEnd=Math.min(sprite.height+y,this.height);for(let yi=y;yi<yEnd;yi++)for(let xi=x;xi<xEnd;xi++){let indexSprite=xi-x+(yi-y)*sprite.width;const paletteIndex=sprite.data[indexSprite],char=charMap[paletteIndex]||".";this.buffer.setChar(xi,yi,char)}}}class PackedArray{constructor(size){this.size=size,this.charToNibble={".":0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,L:10,C:11,D:12,F:13,H:14,0:15},this.nibbleToChar=Object.fromEntries(Object.entries(this.charToNibble).map(([k,v])=>[v,k])),this.values=new Uint8Array(this.size/2)}resetValues(){this.values=new Uint8Array(this.size/2)}getByteIndex(index){return index>>1}getValue(index){const byteIndex=this.getByteIndex(index),shift=1&index?0:4;return this.values[byteIndex]>>shift&15}setValue(index,val){const byteIndex=this.getByteIndex(index),shift=1&index?0:4,mask=1&index?240:15;this.values[byteIndex]=this.values[byteIndex]&mask|(15&val)<<shift}getChar(index){return this.nibbleToChar[this.getValue(index)]}setChar(index,char){this.setValue(index,this.charToNibble[char])}}class Transform2D{constructor(T00,T01,T10,T11,b0,b1){this.T00=T00,this.T01=T01,this.b0=b0,this.T10=T10,this.T11=T11,this.b1=b1}multiply(other){const T00=this.T00*other.T00+this.T01*other.T10,T01=this.T00*other.T01+this.T01*other.T11,b0=this.T00*other.b0+this.T01*other.b1+this.b0,T10=this.T10*other.T00+this.T11*other.T10,T11=this.T10*other.T01+this.T11*other.T11,b1=this.T10*other.b0+this.T11*other.b1+this.b1;return new Transform2D(T00,T01,T10,T11,b0,b1)}transformX(x,y){return this.T00*x+this.T01*y+this.b0}transformY(x,y){return this.T10*x+this.T11*y+this.b1}determinant(){return this.T00*this.T11-this.T01*this.T10}isInvertible(eps=1e-8){const det=this.determinant();return isFinite(det)&&Math.abs(det)>eps}inverse(){const det=this.determinant();if(!isFinite(det)||Math.abs(det)<1e-8)return null;const iT00=this.T11/det,iT01=-this.T01/det,iT10=-this.T10/det,iT11=this.T00/det,ib0=-(iT00*this.b0+iT01*this.b1),ib1=-(iT10*this.b0+iT11*this.b1);return new Transform2D(iT00,iT01,iT10,iT11,ib0,ib1)}}class Metrics{static testEfficiency(fn,...args){const start=performance.now();fn(...args);const end=performance.now();console.log(`Execution time: ${(end-start).toFixed(4)} ms`)}static testMethodEfficiency(obj,methodName,...args){let sum=0;for(let i=0;i<100;i++){const start=performance.now();obj[methodName](...args);sum+=performance.now()-start}console.log(`${methodName} executed in ${(sum/100).toFixed(4)} ms`)}static toMB(byteLength){return byteLength/1048576}static logHeapUsage(){console.log(Metrics.toMB(performance.memory.usedJSHeapSize).toFixed(2),"MB")}}function blit(sourceBuffer,destBuffer,copyWidth,copyHeight,x=0,y=0){const srcStride=sourceBuffer.width,destStride=destBuffer.width,destWidth=destBuffer.width,destHeight=destBuffer.height;let sx=0,sy=0;if(x<0&&(sx=-x,copyWidth+=x,x=0),y<0&&(sy=-y,copyHeight+=y,y=0),x+copyWidth>destWidth&&(copyWidth=destWidth-x),y+copyHeight>destHeight&&(copyHeight=destHeight-y),copyWidth<=0||copyHeight<=0)return;const maxHeight=Math.min(copyHeight,destHeight-y);for(let row=0;row<maxHeight;row++){let curDestX=x,curSrcX=sx,remainingWidth=copyWidth;const destRowY=y+row,srcRowY=sy+row;if(!((1&curDestX)==(1&curSrcX))&&(curSrcX++,remainingWidth--,remainingWidth<=0))continue;if(1&curDestX){const destBufferIndex=getBufferIndex(curDestX,destRowY,destStride),sourceBufferIndex=getBufferIndex(curSrcX,srcRowY,srcStride);destBuffer.pixels.setValue(destBufferIndex,sourceBuffer.pixels.getValue(sourceBufferIndex)),curDestX++,curSrcX++,remainingWidth--}const fullBytes=remainingWidth>>1;if(fullBytes>0){const destBufferIndex=getBufferIndex(curDestX,destRowY,destStride),sourceBufferIndex=getBufferIndex(curSrcX,srcRowY,srcStride),dStart=destBuffer.pixels.getByteIndex(destBufferIndex),sStart=sourceBuffer.pixels.getByteIndex(sourceBufferIndex);destBuffer.pixels.values.set(sourceBuffer.pixels.values.subarray(sStart,sStart+fullBytes),dStart)}if(1&remainingWidth){const destLastIndex=curDestX+--remainingWidth,srcLastIndex=curSrcX+remainingWidth;destBuffer.pixels.setValue(destLastIndex,sourceBuffer.pixels.getValue(srcLastIndex))}}}function getBufferIndex(x,y,width){return x+y*width}class Sprite{constructor(byteArray,width,height,bitDepth=8){this.width=width,this.height=height,this.bitDepth=bitDepth,this.data=byteArray}fromBase64RGBA(base64,width,height,inputBitDepth=8){const bin=atob(base64),rgbaBytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)rgbaBytes[i]=this._normaliseChannel(bin.charCodeAt(i));let paletteBytes=new Uint8Array(Math.floor(bin.length/4));return rgbaBytes.reduce((paletteIndex,cur,i,src)=>{if(i%4==0&&i+3<src.length){const chunk=src.slice(i,i+4),val=this._rgbaToPalette(chunk);return paletteBytes[paletteIndex]=val,paletteIndex+1}return paletteIndex},0),new Sprite(paletteBytes,width,height,inputBitDepth)}getBitmap(){return this.data.reduce((acc,val,i)=>{let char=acc+charMap[val];return(i+1)%this.width===0&&(char+="\n"),char},"")}static rgbaToChar(rgbaValues){const mappedVal=Sprite._rgbaToPalette(rgbaValues);return charMap[mappedVal]}static _rgbaToPalette(rgbaValues){let mappedVal,minDif=5;const alpha=rgbaValues[3],rgbValues=rgbaValues.slice(0,3);if(alpha>=.5)return 15;for(const[paletteVal,charRgb]of Object.entries(colorMap)){const sumDif=rgbValues.reduce((sumDif,val,index)=>sumDif+Math.abs(charRgb[index]-val),0);sumDif<minDif&&(mappedVal=paletteVal,minDif=sumDif)}return mappedVal}_normaliseChannel(channelVal){return Math.round(channelVal/2**this.bitDepth)}}const colorMap={0:[0,0,0],1:[.282,.314,.337],2:[.569,.592,.608],3:[.973,.976,.98],4:[.922,.286,.392],5:[.545,.251,.184],6:[.102,.694,.976],7:[.071,.078,.878],8:[.996,.906,.059],9:[.58,.549,.2],10:[.176,.878,.243],11:[.11,.584,.059],12:[.957,.424,.733],13:[.667,.227,.773],14:[.957,.439,.09]},CHARS="0L123C756F4D8H9.",charMap=Object.fromEntries([...CHARS].map((ch,i)=>[i,ch]));


///////// RAYCASTER DEMO CODE ///////////

class HUD {

  constructor(HUDSurface) {
    this.surface = HUDSurface
    this.faceWidth = 24
    this.faceHeight = 34

    this.surface.drawRect(0, 0, this.surface.width, this.surface.height, "7")

    //this.logoSprite = new Sprite(logoRGB, 54,  23)
    //this.surface.drawSprite(102, 7, this.logoSprite)


    this.surface.drawRect(0, 0, this.surface.width, 2, "5")
    //this.surface.drawRect(this.surface.width / 2 - this.faceWidth / 2 - 2, 0, this.faceWidth + 4, this.surface.height, "5")

    //this.faceFrontSprite = new Sprite(faceFrontRGB, this.faceWidth, this.faceHeight)
    //this.faceLeftSprite = new Sprite(faceLeftRGB, this.faceWidth, this.faceHeight)
    //this.faceRightSprite = new Sprite(faceRightRGB, this.faceWidth, this.faceHeight)

  
    this.onIdle()

  }

  onRightInput() {
    //this.surface.drawSprite(this.surface.width / 2 - this.faceWidth / 2, 
                          // 2, this.faceRightSprite)
  }

  onLeftInput() {
     //this.surface.drawSprite(this.surface.width / 2 - this.faceWidth / 2, 
                          // 2, this.faceLeftSprite)
  }

  onIdle() {
     //this.surface.drawSprite(this.surface.width / 2 - this.faceWidth / 2, 
                          // 2, this.faceFrontSprite)
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

  drawRay(mapSurface) {
    let color = this.isVertical ? "7" : "8"

     mapSurface.drawLine(this.x, 
                      this.y, 
                      this.x + Math.cos(this.radians) * this.length, 
                      this.y - Math.sin(this.radians) * this.length, 
                      color)
  

    if (this.hitX && this.hitY) {
      mapSurface.drawCircle(this.hitX, this.hitY, 1, "3")
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

  drawPlayer(mapSurface) {
    mapSurface.drawRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size, "3")

   
    mapSurface.drawLine(this.x, 
                      this.y, 
                      this.x + Math.cos(this.theta) * this.lineLength, 
                      this.y - Math.sin(this.theta) * this.lineLength, 
                      "6")
  }
  
}

class RaycastRenderer {
  
  constructor(pixelRenderer, mapSurface, viewSurface, HUDCanvas) {


      this.mapSurface = mapSurface
      this.viewSurface = viewSurface
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

      this.tileSize = Math.floor(this.mapSurface.width / this.mapSizeX); 
    
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
    this.viewSurface.clearSurface()
    this.viewSurface.drawRect(0, 0, 10, 10, "2")

    var xPos = 0;
    var xOffset = this.viewSurface.width / this.raysArray.length
    var yCenter = this.viewSurface.height / 2


    for (let ray of this.raysArray) {

        const distance = this.fixFishEye(ray.length, ray.radians)

        const wallHeight = (4 / distance) * this.viewSurface.height
        
        const yPosTop = Math.max(yCenter - wallHeight / 2, 0)
        const yPosBot = Math.min(yCenter + wallHeight / 2, this.viewSurface.height)

        //console.log(xPos, yPosTop, xOffset, wallHeight)
        
        this.viewSurface.drawRect(xPos, yPosTop, xOffset, wallHeight, "1")

        this.viewSurface.drawRect(xPos, yPosBot, xOffset, this.viewSurface.height - yPosBot, "0")

        xPos += xOffset
    }

}

  drawMap() {

    const {tileSize, mapSizeY, mapSizeX, mapSurface, map, player, rend} = this
    
     for (var row = 0; row < mapSizeY; row++) {
            for (var col = 0; col < mapSizeX; col++) {
                const cell = map[row][col]
                if (cell > 0) {
                    mapSurface.drawRect(col * tileSize, row * tileSize,  tileSize - 1, tileSize - 1, "5")
                }
            }
        }


    player.drawPlayer(mapSurface)
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
              ray.drawRay(this.mapSurface)
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
    
        this.mapSurface.clearSurface()
        this.castRays()
        this.drawMap()
        this.viewSurface.clearSurface()
        this.drawView()
        this.rend.beginFrame()
        this.rend.endFrame()
    
        setTimeout(() => { this.tick() }, 100)
  }
}



let renderer = new SubTileRenderer(10, 8) // 10x8 tiles = 160x128 pixels

let mapSurface = new Surface(32, 36)

let viewSurface = new Surface(160, 128 - 34)

let faceHUDSurface = new Surface(160, 34)
let gameHUD = new HUD(faceHUDSurface)


renderer.addSurface(viewSurface, 0, 0)
renderer.addSurface(faceHUDSurface, 160/2 - faceHUDSurface.width / 2, 
                   128 - faceHUDSurface.height)
renderer.addSurface(mapSurface, 160/2 - mapSurface.width / 2, 97)


let raycasterRend = new RaycastRenderer(renderer, mapSurface, viewSurface, gameHUD)












