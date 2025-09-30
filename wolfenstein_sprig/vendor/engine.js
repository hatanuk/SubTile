



/**
 * Class representation of a sprite animation
 * @param sprites {int[]} list of sprite indexes to animate
 * @param loop {boolean} whether the animation should loop
 * @constructor
 */
function Animation(sprites, loop=false) {
    this.sprites = sprites;
    this.spriteIndex = 0;
    this.timer = 0;
    this.loop = loop
}


/**
 * Class representation of a flashing effect
 * @param red {number} red intensity in [0, 1)
 * @param green {number} green intensity in [0, 1)
 * @param blue {number} blue intensity in [0, 1)
 * @constructor
 */
function Flash(red, green, blue, duration = 6) {
    /**
     * Frames counter since flash effect started
     * @type {number}
     */
    this.timer = 0;
    /**
     * Red intensity of the flash
     * @type {number}
     */
    this.red = red;
    /**
     * Green intensity of the flash
     * @type {number}
     */
    this.green = green;
    /**
     * Blue intensity of the flash
     * @type {number}
     */
    this.blue = blue;
    /**
     * Duration of the flash in frames
     * @type {number}
     */
    this.duration = duration;
}


/**
 * Main drawing loop called at each frame
 */
function draw() {
    // draw visible game elements
    drawWalls();
    drawThings();
    drawWeapon();
    if (shouldDrawMap) {
        drawMap();
        shouldDrawMap = false;
    }
    // Update SubTile renderer after drawing
    if (typeof renderer !== 'undefined' && renderer.endFrame) {
        renderer.endFrame();
    }
}


/**
 * Modify the palette to flash the screen.
 * @param redFlash {number} red intensity of the flash
 * @param greenFlash {number} green intensity of the flash
 * @param blueFlash {number} blue intensity of the flash
 */
function flashPalette(redFlash, greenFlash, blueFlash) {
    for (let i = 0; i < gamePalette.length; i++) {
        let v = gamePalette[i];
        // extract each component
        let r = v % 256;
        let g = (v >>> 8) % 256;
        let b = (v >>> 16) % 256;
        r += ~~(redFlash * (255 - r));
        g += ~~(greenFlash * (255 - g));
        b += ~~(blueFlash * (255 - b));
        // recreate the Uint32 palette value from components
        palette[i] = (255 << 24) + (b << 16) + (g << 8) + r;
    }
}


/**
 * Draw walls, ceiling and floor.
 * Drawing is done for each column, finding the corresponding wall and its distance to the player by ray casting, and
 * then completing by drawing ceiling and floor.
 */
function drawWalls() {
    for (let i = 0; i < pixelWidth; i++) {
        // cast a ray for each screen column
        let isPushwall = false;  // remember if wall is a pushwall to be able to draw it differently if needed

        // current column position on the camera plane
        const shift = fov * ((i << 1) - pixelWidth) / pixelWidth;
        // direction of the ray
        let dx = player.dx - shift * player.dy;
        let dy = player.dy + shift * player.dx;

        // direction in which the ray moves along each axis
        const stepx = dx >= 0 ? 1 : -1;
        const stepy = dy >= 0 ? 1 : -1;
        // take absolute values of ray direction
        dx = stepx * dx;
        dy = stepy * dy;
        // cell position of the ray on the map (starting from the player position)
        let cx = ~~player.x;
        let cy = ~~player.y;
        // remaining fractional distance from the ray position to the next cell (0 < rfx, rfy <= 1)
        let rfx = stepx > 0 ? 1 - (player.x % 1) : player.x % 1;
        if (rfx === 0) {
            rfx = 1;
            cx += stepx;
        }
        let rfy = stepy > 0 ? 1 - (player.y % 1) : player.y % 1;
        if (rfy === 0) {
            rfy = 1;
            cy += stepy;
        }

        // total time traveled by the ray
        let t = 0;

        // plane0 value of the cell visited by the ray
        let m0;
        // coordinate on the wall tile where the ray hit (0 <= tx <= 1)
        let tx;
        // index of tile to display
        let textureIndex;

        while (true) {
            m0 = map0(cx, cy);
            if (m0 <= 63) {
                // hit a wall
                let wallShift = 0;
                if (map1(cx, cy) === 98) {
                    isPushwall = true;
                    // pushwall
                    const timer = wallTimers.find(function(obj) { return obj.x === cx && obj.y === cy; });
                    if (timer !== undefined) {
                        wallShift = timer.t / 64;
                        if (timer.dx !== 0) {
                            // wall moves horizontally
                            if (dx * rfy >= dy * wallShift) {
                                // ray hits wall
                                let dt = wallShift / dx;
                                t += dt;
                                rfy -= dt * dy;
                                rfx -= wallShift;
                            } else {
                                // ray moves to next cell
                                isPushwall = false;
                                let dt = rfy / dy;
                                t += dt;
                                rfy = 1;
                                cy += stepy;
                                rfx -= dt * dx;
                                continue;
                            }
                        } else {
                            // wall moves vertically
                            if (dy * rfx >= dx * wallShift) {
                                // ray hits wall
                                let dt = wallShift / dy;
                                t += dt;
                                rfx -= dt * dx;
                                rfy -= wallShift;
                            } else {
                                // ray moves to next cell
                                isPushwall = false;
                                let dt = rfx / dx;
                                t += dt;
                                rfx = 1;
                                cx += stepx;
                                rfy -= dt * dy;
                                continue;
                            }
                        }
                    }
                }
                if (rfx === 1 - wallShift) {
                    // NS wall
                    textureIndex = 2 * m0 - 1;
                    // fix texture orientation depending on ray direction
                    tx = stepx * stepy > 0 ? 1 - rfy : rfy;
                } else {
                    // EW wall
                    textureIndex = 2 * m0 - 2;
                    // fix texture orientation depending on ray direction
                    tx = stepx * stepy < 0 ? 1 - rfx : rfx;
                }
                break;
            } else if (m0 <= 101) {
                // hit a door

                // check if door has an associated timer
                let doorShift = 0;
                let timer = doorTimers.find(function(obj) { return obj.x === cx && obj.y === cy; });
                if (timer !== undefined) {
                    if (timer.opening) {
                        doorShift = timer.t / 64;
                    } else {
                        doorShift = 1 - timer.t / 64;
                    }
                }
                if (!plane2[cx][cy]) {
                    doorShift = 1;
                }

                if (m0 % 2 === 0) {
                    // NS door
                    if (rfx >= .5 && (rfx - .5) * dy < rfy * dx) {
                        // ray hits the central door line
                        let dt = (rfx - .5) / dx;
                        t += dt;
                        rfy -= dt * dy;
                        rfx = .5;
                        tx = stepy > 0 ? 1 - rfy : rfy;
                        tx -= doorShift;
                        if (tx >= 0) {
                            // ray hits the door
                            switch (m0) {
                                case 90:
                                    textureIndex = 99;
                                    break;
                                case 92:
                                    textureIndex = 105;
                                    break;
                                case 94:
                                    textureIndex = 105;
                                    break;
                                case 100:
                                    textureIndex = 103;
                                    break;
                            }
                            break;
                        }
                    }
                    if (rfx * dy >= rfy * dx) {
                        // hit the side wall
                        let dt = rfy / dy;
                        t += dt;
                        rfx -= dt * dx;
                        rfy = 1;
                        cy += stepy;
                        textureIndex = 100;
                        tx = stepx > 0 ? 1 - rfx: rfx;
                        break;
                    } else {
                        // pass through
                        let dt = rfx / dx;
                        t += dt;
                        rfy -= dt * dy;
                        rfx = 1;
                        cx += stepx;
                    }
                } else {
                    // EW door
                    if (rfy >= .5 && (rfy - .5) * dx < rfx * dy) {
                        // ray hits the central door line
                        let dt = (rfy - .5) / dy;
                        t += dt;
                        rfx -= dt * dx;
                        rfy = .5;
                        tx = stepx > 0 ? 1 - rfx : rfx;
                        tx -= doorShift;
                        if (tx >= 0) {
                            // ray hits the door
                            switch (m0) {
                                case 91:
                                    textureIndex = 98;
                                    break;
                                case 93:
                                    textureIndex = 104;
                                    break;
                                case 95:
                                    textureIndex = 104;
                                    break;
                                case 101:
                                    textureIndex = 102;
                                    break;
                            }
                            break;
                        }
                    }
                    if (rfy * dx >= rfx * dy) {
                        // hit the side wall
                        let dt = rfx / dx;
                        t += dt;
                        rfy -= dt * dy;
                        rfx = 1;
                        cx += stepx;
                        textureIndex = 101;
                        tx = stepy > 0 ? 1 - rfy: rfy;
                        break;
                    } else {
                        // pass through
                        let dt = rfy / dy;
                        t += dt;
                        rfx -= dt * dx;
                        rfy = 1;
                        cy += stepy;
                    }
                }
            }
            // move to the next cell
            if (rfx * dy <= rfy * dx) {
                // move to next cell horizontally
                let dt = rfx / dx;
                t += dt;
                rfx = 1;
                cx += stepx;
                rfy -= dt * dy;
            } else {
                // move to next cell vertically
                let dt = rfy / dy;
                t += dt;
                rfy = 1;
                cy += stepy;
                rfx -= dt * dx;
            }
        }

        // compute ray location
        let h = wallHeight / (2 * t); // height of the line representing the wall on the current column
        zIndex[i] = t;

        let yi = ~~(pixelHeight / 2 - h);
        let yf = (pixelHeight / 2 - h) % 1;
        let stepi = ~~(h / 32);
        let stepf = (h / 32) % 1;
        let texelOffset = wallTexturesOffset + 4096 * textureIndex + 64 * ~~(64 * tx);
        // draw ceiling and floor
        // if (surfaceTexturesOn) {
        //     for (let j = 0; j < y; j++) {
        //         let d = wallHeight / (pixelHeight - 2 * j);
        //         let fx = sx + (rx - sx) * (d - 1) / (t - 1);
        //         let fy = sy + (ry - sy) * (d - 1) / (t - 1);
        //         drawPixel(i, j, getSurfaceTexel(fx % 1, fy % 1, 1));
        //         drawPixel(i, pixelHeight - j, getSurfaceTexel(fx % 1, fy % 1, 0));
        //     }
        // } else {
            for (let j = 0; j <= yi; j++) {
                pixels.setUint32((pixelWidth * j + i) << 2, palette[29], true);
                pixels.setUint32((pixelWidth * (pixelHeight - 1 - j) + i) << 2, palette[25], true);
            }
        // }
        // draw the wall
        for (let j = texelOffset; j < texelOffset + 64; j++) {
            let col;
            if (showPushwalls && isPushwall) {
                col = paletteRed[VSWAP.getUint8(j)];
            } else {
                col = palette[VSWAP.getUint8(j)];
            }
            yf += stepf;
            if (yf >= 1) {
                for (let k = Math.max(0, yi); k < Math.min(pixelHeight, yi + stepi + 1); k++) {
                    pixels.setUint32((pixelWidth * k + i) << 2, col, true);
                }
                yi += stepi + 1;
                yf -= 1;
            } else {
                for (let k = Math.max(0, yi); k < Math.min(pixelHeight, yi + stepi); k++) {
                    pixels.setUint32((pixelWidth * k + i) << 2, col, true);
                }
                yi += stepi;
            }
        }
    }
}


/**
 * Draw all things on screen from furthest to nearest
 */
function drawThings() {
    for (let k = 0; k < things.length; k++) {
        let t = things[k];
        if (t.rx < player.radius) {
            // thing is behind the screen
            return;
        } else if (Math.abs(t.ry) > t.rx + 1) {
            // thing is out of field of view
            continue;
        }

        let th = wallHeight / t.rx;
        let tx = ~~((t.ry / t.rx + fov) * wallHeight - th / 2);
        let ty = ~~((pixelHeight - th) / 2);
        let index = t.spriteIndex;
        if (t.orientable) {
            index += (Math.round(4 * Math.atan2(t.x - player.x, t.y - player.y) / Math.PI - t.direction) + 16) % 8;
        }

        drawSprite(index, tx, ty, th, t.rx);
    }
}


/**
 * Draw the player's weapon in hand
 */
function drawWeapon() {
    let height = zoom === 1 ? 384 : 192;
    drawSprite(player.weaponSprite, pixelWidth / 2 - height / 2, pixelHeight - height, height);
}


/**
 * Draw a sprite on screen
 * @param index {number} index of the sprite texture
 * @param x {number} x-coordinate of the top-left corner of the rendered sprite
 * @param y {number} y-coordinate of the top-left corner of the rendered sprite
 * @param height {number} height of the rendered sprite in pixels
 * @param dist {number} distance from player (if sprite is farther than zIndex, column is not drawn)
 */
function drawSprite(index, x, y, height, dist=0) {
    // rendered size of sprite pixels
    let scale = Math.ceil(height / 64);
    // read sprite data from VSWAP.WL6
    let firstSprite = VSWAP.getUint16(2, true);
    let spriteOffset = VSWAP.getUint32(6 + 4 * (firstSprite + index), true);
    let firstCol = VSWAP.getUint16(spriteOffset, true);
    let lastCol = VSWAP.getUint16(spriteOffset + 2, true);
    let nbCol = lastCol - firstCol + 1;
    let pixelPoolOffset = spriteOffset + 4 + 2 * nbCol;
    // draw pixels column by column, post by post
    for (let col = firstCol; col <= lastCol; col++) {
        let colOffset = spriteOffset + VSWAP.getUint16(spriteOffset + 4 + 2 * (col - firstCol), true);
        while (true) {
            let endRow = VSWAP.getUint16(colOffset, true) / 2;
            if (endRow === 0) {
                break;
            }
            let startRow = VSWAP.getUint16(colOffset + 4, true) / 2;
            colOffset += 6;
            for (let row = startRow; row < endRow; row++) {
                drawScaledPixel(
                    x + ~~(col * height / 64),
                    y + ~~(row * height / 64),
                    VSWAP.getUint8(pixelPoolOffset),
                    scale,
                    dist
                );
                pixelPoolOffset += 1;
            }
        }
    }
}


/**
 * Draw a scaled pixel on the canvas. A "scaled" pixel will cover a square of scale x scale pixels on the canvas,
 * starting from the given coordinates
 * @param x {number} x-coordinate of the top left corner of the square
 * @param y {number} y-coordinate of the top left corner of the square
 * @param col {number} palette index of the color
 * @param scale {number} scale of the pixel
 * @param dist {number} (optional) distance of the object that contains the pixel. If the distance is larger than the
 * zIndex for a given column, no pixel will be drawn on the canvas
 */
function drawScaledPixel(x, y, col, scale, dist=0) {
    if (col !== undefined) {
        let color = palette[col];
        for (let col = x >= 0 ? x : 0; col < x + scale && col < pixelWidth; col++) {
            if (dist >= zIndex[col]) {
                // sprite is hidden on this column
                continue;
            }
            for (let row = y >= 0 ? y : 0; row < y + scale && row < pixelHeight; row++) {
                pixels.setUint32((pixelWidth * row + col) << 2, color, true);
            }
        }
    }
}


