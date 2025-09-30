// These are initialized before all other files in the minified script

// SubTile globals
let renderer
let gameSurface
let hudSurface

/**
 * Representation of the player character
 * @type {Player}
 */
let player;
/**
 * Index of current level
 * @type {number}
 */
let currentLevel;
/**
 * Dictionary containing scoring elements:
 * - kills (count and total)
 * - treasures (count and total)
 * - secrets (count and total)
 */
let score;
/**
 * Things in the level (sprites, enemies, powerups, etc.)
 * @type {Array}
 */
let things;
/**
 * Array of door timers for doors being active (opening, open or closing)
 * The elements in the array are objects with attributes
 * - x: x-coordinate of the door
 * - y: y-coordinate of the door
 * - opening: boolean indicating if the door is opening (true) or closing (false)
 * - t: counter since door was open
 */
let doorTimers;
/**
 * Array of wall timers for secret passages being active (moving)
 * The elements in the array are objects with attributes
 * - x: the x-coordinate of the wall
 * - y: the y-coordinate of the wall
 * - t: time counter since the wall started moving
 * - dx, dy: indicate the direction in which the wall is moving (unit vector)
 */
let wallTimers;

let opponentPlayers = {};



/**
 * Canvas for drawing HUD on top of game screen
 * @type {HTMLCanvasElement}
 */
let canvasHUD;
/**
 * Context for HUD canvas
 * @type {CanvasRenderingContext2D}
 */
let contextHUD;
let shouldDrawMap = true;


/**
 * DataView containing the data from VSWAP.WL6
 * @type {DataView}
 */
let VSWAP;
/**
 * ArrayBuffers containing the data from MAPHEAD.WL6 and GAMEMAPS.WL6
 * @type {ArrayBuffer}
 */
let MAPHEAD, GAMEMAPS;
/**
 * Offset in the VSWAP.WL6 file where the first wall texture starts
 * @type {number}
 */
let wallTexturesOffset;
/**
 * DataViews of the level data from GAMEMAPS.WL6
 * @type {DataView}
 */
let plane0, plane1;
/**
 * 2D array indicating if each cell of the map is blocking or not
 */
let plane2;

/**



/**
 * Game pixels rendered on screen (width)
 * @type {number}
 */
let pixelWidth;
/**
 * Game pixels rendered on screen (height)
 * @type {number}
 */
let pixelHeight;
/**
 * Multiplicative rendering factor (1 game pixel is rendered as zoom x zoom pixels in the canvas)
 * @type {number}
 */
let zoom;
/**
 * Field of vision
 * @type {number}
 */
let fov = 1;
/**
 * Whether the draw function should be called every frame (60 fps) or every other frame (30 fps)
 * @type {boolean}
 */
let fps60 = true;
/**
 * Whether the draw function should be called on next frame (used when running at 30 fps)
 * @type {boolean}
 */
let drawNextFrame = true;
/**
 * Rendered size of a wall
 * @type {number}
 */
let wallHeight;
/**
 * Whether surface textures (ceiling and floor) should be displayed)
 */
let surfaceTexturesOn = false;
/**
 * Array containing distance of wall for each pixel column on screen
 * @type {number[]}
 */
let zIndex = [];
/**
 * Indicates whether the canvas has started it drawing loop
 * @type {boolean}
 */
let isDrawing = false;
/**
 * Game color palette (RGBA, 32bit little-endian)
 * @type {Uint32Array}
 */
let gamePalette = new Uint32Array([
    4278190080, 4289200128, 4278233088, 4289243136, 4278190248, 4289200296, 4278211752, 4289243304,
    4283716692, 4294726740, 4283759700, 4294769748, 4283716860, 4294726908, 4283759868, 4294769916,
    4293717228, 4292664540, 4291875024, 4290822336, 4290032820, 4289243304, 4288190616, 4287401100,
    4286348412, 4285558896, 4284769380, 4283716692, 4282927176, 4281874488, 4281084972, 4280295456,
    4278190332, 4278190316, 4278190304, 4278190292, 4278190280, 4278190268, 4278190256, 4278190244,
    4278190232, 4278190216, 4278190204, 4278190192, 4278190180, 4278190168, 4278190156, 4278190144,
    4292401404, 4290296060, 4288453884, 4286348540, 4284243196, 4282401020, 4280295676, 4278190332,
    4284262652, 4282423548, 4280322300, 4278221052, 4278217956, 4278214860, 4278211764, 4278209692,
    4292410620, 4290313468, 4288478460, 4286381308, 4284283132, 4282447100, 4280349948, 4278252796,
    4278245604, 4278240460, 4278234292, 4278230172, 4278224004, 4278217840, 4278211672, 4278206528,
    4284284112, 4282449092, 4280351924, 4278254752, 4278248592, 4278242432, 4278236276, 4278230112,
    4292410584, 4290313404, 4288478364, 4286381184, 4284284000, 4282448960, 4280351776, 4278254592,
    4278254592, 4278250496, 4278247424, 4278244352, 4278241284, 4278238212, 4278235140, 4278232068,
    4278228996, 4278224900, 4278221828, 4278218756, 4278215684, 4278212612, 4278209540, 4278206468,
    4294769880, 4294769848, 4294769820, 4294507644, 4294769756, 4294769728, 4294769696, 4294769664,
    4293190656, 4291611648, 4290032640, 4288453632, 4286874624, 4285558784, 4283979776, 4282400768,
    4294753372, 4294750272, 4294748192, 4294745088, 4293168128, 4291591168, 4290014208, 4288437248,
    4294760664, 4294753464, 4294745244, 4294738044, 4294729820, 4294721600, 4294714400, 4294706176,
    4294705152, 4293656576, 4292870144, 4292083712, 4291297280, 4290510848, 4289724416, 4288937984,
    4288151552, 4287102976, 4286316544, 4285530112, 4284743680, 4283957248, 4283170816, 4282384384,
    4280821800, 4281655548, 4280603900, 4279815420, 4278763772, 4278236412, 4294713524, 4294705320,
    4293132440, 4291559552, 4289986676, 4288413792, 4286840912, 4285530180, 4283957300, 4282384424,
    4294760700, 4294752508, 4294745340, 4294737148, 4294728956, 4294721788, 4294713596, 4294705404,
    4293132512, 4291559624, 4289986740, 4288413852, 4286840964, 4285530220, 4283957336, 4282384448,
    4292667644, 4291879164, 4291090684, 4290565372, 4289776892, 4288988412, 4288462076, 4287674620,
    4286623996, 4285572348, 4284521724, 4284257520, 4283993320, 4283730140, 4283465936, 4283202760,
    4282939580, 4282675380, 4282411176, 4282148000, 4281884828, 4281621648, 4281358472, 4281094272,
    4280831092, 4280567916, 4280303708, 4280040532, 4279777352, 4279775296, 4279512120, 4278984744,
    4284743776, 4284769280, 4284506112, 4280025088, 4281073664, 4279247920, 4282908744, 4283433040,
    4281597952, 4280032284, 4283190348, 4284243036, 4282400832, 4281348144, 4281611316, 4294243544,
    4293454008, 4292664476, 4291348596, 4290822216, 4290032672, 4289769504, 4288979968, 4288190464,
    4287400960, 4286874624, 4286348288, 4286085120, 4285821952, 4285558784, 4285295616, 4287103128]);
/**
 * Current palette (can be changed temporarily by some effects)
 * @type {Uint32Array}
 */
let palette = gamePalette.slice();
/**
 * An alternate palette (heavily shifted in the reds) to highlight some objects when needed (not part of the
 * original game)
 * @type {Uint32Array}
 */
let paletteRed = [];
for (let i = 0; i < gamePalette.length; i++) {
    let v = gamePalette[i];
    // extract each component
    let r = v % 256;
    let g = (v >>> 8) % 256;
    let b = (v >>> 16) % 256;
    r += ~~(.5 * (255 - r));
    g = ~~(.75 * g);
    b = ~~(.75 * b);
    // recreate the Uint32 palette value from components
    paletteRed[i] = (255 << 24) + (b << 16) + (g << 8) + r;
}
/**
 * Whether secret pushwalls should be displayed differently (cheat)
 * @type {boolean}
 */
let showPushwalls = false;
/**
 * Current flashing effect (if any)
 * @type {Flash}
 */
let flash;
/**
 * Decode a RLEW-encoded sequence of bytes
 * @param inView {DataView} RLEW-encoded data
 * @returns {DataView} decoded data
 */
function rlewDecode(inView) {
    let mapHeadView = new DataView(MAPHEAD);
    let rlewTag = mapHeadView.getUint16(0, true);
    let size = inView.getUint16(0, true);
    let buffer = new ArrayBuffer(size);
    let outView = new DataView(buffer);
    let inOffset = 2;
    let outOffset = 0;

    while (inOffset < inView.byteLength) {
        let w = inView.getUint16(inOffset, true);
        inOffset += 2;
        if (w === rlewTag) {
            let n = inView.getUint16(inOffset, true);
            let x = inView.getUint16(inOffset + 2, true);
            inOffset += 4;
            for (let i = 0; i < n; i++) {
                outView.setUint16(outOffset, x, true);
                outOffset += 2;
            }
        } else {
            outView.setUint16(outOffset, w, true);
            outOffset += 2;
        }
    }
    return outView;
}


/**
 * Decode a Carmack-encoded sequence of bytes
 * @param inView {DataView} Carmack-encoded data
 * @returns {DataView} decoded data
 */
function carmackDecode(inView) {
    let size = inView.getUint16(0, true);
    let buffer = new ArrayBuffer(size);
    let outView = new DataView(buffer);
    let inOffset = 2;
    let outOffset = 0;

    while (inOffset < inView.byteLength) {
        let x = inView.getUint8(inOffset + 1);
        if (x === 0xA7 || x === 0xA8) {
            // possibly a pointer
            let n = inView.getUint8(inOffset);
            if (n === 0) {
                // exception (not really a pointer)
                outView.setUint8(outOffset, inView.getUint8(inOffset + 2));
                outView.setUint8(outOffset + 1, x);
                inOffset += 3;
                outOffset += 2;
            } else if (x === 0xA7) {
                // near pointer
                let offset = 2 * inView.getUint8(inOffset + 2);
                for (let i = 0; i < n; i++) {
                    outView.setUint16(outOffset, outView.getUint16(outOffset - offset, true), true);
                    outOffset += 2;
                }
                inOffset += 3;
            } else {
                // far pointer
                let offset = 2 * inView.getUint16(inOffset + 2, true);
                for (let i = 0; i < n; i++) {
                    outView.setUint16(outOffset, outView.getUint16(offset + 2 * i, true), true);
                    outOffset += 2;
                }
                inOffset += 4
            }
        } else {
            // not a pointer
            outView.setUint16(outOffset, inView.getUint16(inOffset, true), true);
            inOffset += 2;
            outOffset += 2;
        }
    }
    return outView;
}


/**
 * Asynchronously load a binary file
 * @param url {String} path to file
 * @returns {Promise} A promise containing the content of the file as an ArrayBuffer
 */
function loadBytes(url) {
    const byteArray = EMBED_BYTES[url]
    if (!byteArray) return Promise.reject(new Error("Failed to find embed. Ensure embed_wl6.js script is run first."))
    return Promise.resolve(byteArray.buffer)
}


/**
 * Load game data files:
 * - MAPHEAD.WL6: offsets to the map data for each level in GAMEMAPS.WL6
 * - GAMEMAPS.WL6: levels structure (walls, objects, enemies, etc.
 * - VSWAP.WL6: graphics (walls and sprites) and sounds
 * @returns {Promise} combined promise of all asynchronous tasks
 */
function loadResources() {
    // display splash screen for at least 1 second
    let splashPromise = new Promise(resolve => setTimeout(resolve, 1000));
    // load game files
    let gamemapsPromise = loadBytes("data/GAMEMAPS.WL6");
    let mapheadPromise = loadBytes("data/MAPHEAD.WL6");
    let vswapPromise = loadBytes("data/VSWAP.WL6");
    // prepare game data
    gamemapsPromise.then(req => GAMEMAPS = req);
    mapheadPromise.then(req => MAPHEAD = req);
    vswapPromise.then(req => {
        VSWAP = new DataView(req);
        wallTexturesOffset = VSWAP.getUint32(6, true);
    });

    // return a combined promise
    return Promise.all([splashPromise, gamemapsPromise, mapheadPromise, vswapPromise]);
}


/**
 * Load a given level
 * @param level {number} index of level to load (from 0 to 59)
 */
function loadLevel(level) {
    let mapHeadView = new DataView(MAPHEAD);
    let offset = mapHeadView.getUint32(2 + 4 * level, true);
    let mapHeader = new DataView(GAMEMAPS, offset, 42);
    let plane0View = new DataView(
        GAMEMAPS,
        mapHeader.getUint32(0, true),
        mapHeader.getUint16(12, true),
    );
    plane0 = rlewDecode(carmackDecode(plane0View));
    let plane1View = new DataView(
        GAMEMAPS,
        mapHeader.getUint32(4, true),
        mapHeader.getUint16(14, true),
    );
    plane1 = rlewDecode(carmackDecode(plane1View));
    plane2 = [] ;
    for (let i = 0; i < 64; i++) {
        let line = Array(64);
        line.fill(false);
        plane2.push(line);
    }
    currentLevel = level;
    setupLevel();
}


// Getters and setters for plane0 and plane1
function map0(x, y) {
    try { return plane0.getUint16(2 * (x + 64 * y), true); }
    catch(e) { return undefined; }
}
function setMap0(x, y, value) {
    plane0.setUint16(2 * (x + 64 * y), value, true);
}
function map1(x, y) {
    try { return plane1.getUint16(2 * (x + 64 * y), true); }
    catch(e) { return undefined; }
}
function setMap1(x, y, value) {
    plane1.setUint16(2 * (x + 64 * y), value, true);
}


function drawMap() {
    contextHUD.clearRect(0, 0, 256, 256);
    let doors = [];
    let goldDoors = [];
    let silverDoors = [];
    let elevators = [];
    let pushwalls = [];
    let treasures = [];
    let walls = [];
    contextHUD.fillStyle = '#888888';
    for (let x = 0; x < 64; x++) {
        for (let y = 0; y < 64; y++) {
            let m0 = map0(x, y);
            let m1 = map1(x, y);
            if (m0 <= 63) {
                if (m1 === 98) {
                    pushwalls.push({x: x, y: y});
                } else if (m0 === 21) {
                    elevators.push({x: x, y: y});
                } else if (connectedWall(x, y)) {
                    walls.push({x: x, y: y});
                }
            } else if (m0 === 90 || m0 === 91 || m0 === 100 || m0 === 101) {
                doors.push({x: x, y: y});
            } else if (m0 === 92 || m0 === 93) {
                goldDoors.push({x: x, y: y});
            } else if (m0 === 94 || m0 === 95) {
                silverDoors.push({x: x, y: y});
            } else {
                contextHUD.fillRect(4 * x, 4 * y, 4, 4);
                if (52 <= m1 && m1 <= 56) {
                    treasures.push({x: x, y: y});
                }
            }
        }
    }
    // walls
    contextHUD.fillStyle = '#000000';
    for (let i = 0; i < walls.length; i++) {
        contextHUD.fillRect(4 * walls[i].x, 4 * walls[i].y, 4, 4);
    }
    contextHUD.fillStyle = '#444444';
    // obstacles
    for (let i = 0; i < things.length; i++) {
        let t = things[i];
        if (t.blocking) {
            contextHUD.fillRect(4 * (t.x - .5), 4 * (t.y - .5), 4, 4);
        }
    }
    // doors
    contextHUD.fillStyle = '#FFFFFF';
    for (let i = 0; i < doors.length; i++) {
        contextHUD.fillRect(4 * doors[i].x, 4 * doors[i].y, 4, 4);
    }
    // treasures
    for (let i = 0; i < things.length; i++) {
        let t = things[i];
        if (31 <= t.spriteIndex && t.spriteIndex <= 35) {
            contextHUD.fillRect(4 * (t.x - .5) + 1, 4 * (t.y - .5) + 1, 2, 2);
        }
    }
    // gold doors
    contextHUD.fillStyle = '#FFFF00';
    for (let i = 0; i < goldDoors.length; i++) {
        contextHUD.fillRect(4 * goldDoors[i].x, 4 * goldDoors[i].y, 4, 4);
    }
    // gold keys
    for (let i = 0; i < things.length; i++) {
        let t = things[i];
        if (t.spriteIndex === 22) {
            contextHUD.fillRect(4 * (t.x - .5) + 1, 4 * (t.y - .5) + 1, 2, 2);
        }
    }
    // silver doors
    contextHUD.fillStyle = '#00FFFF';
    for (let i = 0; i < silverDoors.length; i++) {
        contextHUD.fillRect(4 * silverDoors[i].x, 4 * silverDoors[i].y, 4, 4);
    }
    // silver keys
    for (let i = 0; i < things.length; i++) {
        let t = things[i];
        if (t.spriteIndex === 23) {
            contextHUD.fillRect(4 * (t.x - .5) + 1, 4 * (t.y - .5) + 1, 2, 2);
        }
    }
    // elevators
    contextHUD.fillStyle = '#FF8F00';
    for (let i = 0; i < elevators.length; i++) {
        contextHUD.fillRect(4 * elevators[i].x, 4 * elevators[i].y, 4, 4);
    }
    // secret pushwalls
    contextHUD.fillStyle = '#ff0000';
    for (let i = 0; i < pushwalls.length; i++) {
        contextHUD.fillRect(4 * pushwalls[i].x, 4 * pushwalls[i].y, 4, 4);
    }
    // enemies
    for (let i = 0; i < things.length; i++) {
        let t = things[i];
        if (t.alive) {
            contextHUD.fillRect(4 * (t.x - .5) + 1, 4 * (t.y - .5) + 1, 2, 2);
        }
    }
    contextHUD.fillStyle = '#00FF00';
    contextHUD.fillRect(4 * ~~player.x, 4 * ~~player.y, 4, 4);
}

function connectedWall(x, y) {
    return map0(x - 1, y) > 63 || map0(x + 1, y) > 63 || map0(x, y - 1) > 63 || map0(x, y + 1) > 63 ||
        map0(x - 1, y - 1) > 63 || map0(x - 1, y + 1) > 63 || map0(x + 1, y - 1) > 63 || map0(x + 1, y + 1) > 63;
}




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




/**
 * Class representation of the game player character
 * @constructor
 */
function Player() {
    /**
     * Position of the player on the map (x-coordinate)
     * @type {number}
     */
    this.x = 0;
    /**
     * Position of the player on the map (y-coordinate)
     * @type {number}
     */
    this.y = 0;
    /**
     * Player facing direction (x-value)
     * @type {number}
     */
    this.dx = 0;
    /**
     * Player facing direction (y-value)
     * @type {number}
     */
    this.dy = 0;
    /**
     * Walking speed
     * @type {number}
     */
    this.speed = 0.065;
    /**
     * Turning speed
     * @type {number}
     */
    this.speed_a = 0.05;
    /**
     * Player radius (for collision detection)
     * @type {number}
     */
    this.radius = 0.25;
    /**
     * Sprite index to display as player's weapon
     * @type {number}
     */
    this.weaponSprite = 421;
    /**
     * Whether the player has collected the silver key
     * @type {boolean}
     */
    this.silverKey = false;
    /**
     * Whether the player has collected the gold key
     * @type {boolean}
     */
    this.goldKey = false;
    /**
     * Whether the player should move forward on next frame
     * @type {boolean}
     */
    this.moveForward = false;
    /**
     * Whether the player should move backward on next frame
     * @type {boolean}
     */
    this.moveBackward = false;
    /**
     * Whether the player should strafe left on next frame
     * @type {boolean}
     */
    this.strafeLeft = false;
    /**
     * Whether the player should strafe right on next frame
     * @type {boolean}
     */
    this.strafeRight = false;
    /**
     * Whether the player should turn to the left on next frame
     * @type {boolean}
     */
    this.turnLeft = false;
    /**
     * Whether the player should turn to the right on next frame
     * @type {boolean}
     */
    this.turnRight = false;
    /**
     * Angle by which the player should turn on next frame (normalized, will be multiplied by `this.speed_a`)
     * @type {number}
     */
    this.turnAngle = 0;
    /**
     * Check whether the player can go to the given location
     * @param x {number} x-coordinate of the position
     * @param y {number} y-coordinate of the position
     * @returns {boolean} whether the location is valid for the player
     */
    this.canMoveTo = function (x, y) {
        let r = this.radius;
        let fx = x % 1;
        x = ~~x;
        let fy = y % 1;
        y = ~~y;

        if (plane2[x][y]) return false;
        if (fx < r) {
            if (plane2[x - 1][y]) return false;
            if (fy < r && plane2[x - 1][y - 1]) return false;
            if (fy > 1 - r && plane2[x - 1][y + 1]) return false;
        }
        if (fx > 1 - r) {
            if (plane2[x + 1][y]) return false;
            if (fy < r && plane2[x + 1][y - 1]) return false;
            if (fy > 1 - r && plane2[x + 1][y + 1]) return false;
        }
        if (fy < r && plane2[x][y - 1]) return false;
        if (fy > 1 - r && plane2[x][y + 1]) return false;
        return true;
    };

    /**
     * Move forward
     * @param length {number} distance to move (use negative value to move backwards)
     * @param sideways {number} distance to move towards the right (strafe)
     */
    this.move = function (length, sideways = 0) {
        let oldx = ~~this.x;
        let oldy = ~~this.y;
        let x = this.x + this.dx * length - this.dy * sideways;
        let y = this.y + this.dy * length + this.dx * sideways;
        if (this.canMoveTo(x, this.y)) {
            this.x = x;
        }
        if (this.canMoveTo(this.x, y)) {
            this.y = y;
        }
        let newx = ~~this.x;
        let newy = ~~this.y;
        if (newx !== oldx || newy !== oldy) {
            player.collect(newx, newy);
            shouldDrawMap = true;
        }
    };

    /**
     * Turn right
     * @param alpha {number} angle in radians to rotate (use negative value to turn left)
     */
    this.turn = function (alpha) {
        let dx = this.dx * Math.cos(alpha) - this.dy * Math.sin(alpha);
        this.dy = this.dx * Math.sin(alpha) + this.dy * Math.cos(alpha);
        this.dx = dx;
    };

    /**
     * Activate a cell in front of the player (open/close door, push secret wall)
     */
    this.activate = function () {
        let x = ~~player.x;
        let y = ~~player.y;
        let dx = 0;
        let dy = 0;
        if (Math.abs(player.dx) >= Math.abs(player.dy)) {
            dx = player.dx >= 0 ? 1 : -1;
            x += dx;
        } else {
            dy = player.dy >= 0 ? 1 : -1;
            y += dy;
        }
        let m0 = map0(x, y);
        let m1 = map1(x, y);
        if (m0 === 21 && dx !== 0) {
            // elevator
            loadNextLevel();
        }
        if (90 <= m0 && m0 <= 101) {
            // door
            if ((m0 === 92 || m0 === 93) && !player.goldKey) {
                // gold-locked door
                return;
            }
            if ((m0 === 94 || m0 === 95) && !player.silverKey) {
                // silver-locked door
                return;
            }
            let timer = doorTimers.find(function (obj) {
                return obj.x === x && obj.y === y;
            });
            if (!timer) {
                let opening = plane2[x][y];
                if (!opening) {
                    if ((dx > 0 && x - player.x <= player.radius) ||
                        (dx < 0 && player.x - x - 1 <= player.radius) ||
                        (dy > 0 && y - player.y <= player.radius) ||
                        (dy < 0 && player.y - y - 1 <= player.radius)) {
                        // player is too close to the door, the door cannot close
                        return;
                    } else {
                        // the door closes (it becomes blocking immediately)
                        plane2[x][y] = true;
                    }
                }
                doorTimers.push({x: x, y: y, t: 0, opening: opening});
            }
        } else if (m1 === 98) {
            // pushwall
            let timer = wallTimers.find(function (obj) {
                return obj.x === x && obj.y === y;
            });
            if (!timer && map0(x + dx, y + dy) >= 106) {
                // there is no active timer for this wall, and it can move backwards
                wallTimers.push({x: x, y: y, t: 0, dx: dx, dy: dy, steps: 2});
                score.secrets += 1;
                updateScore();
            }
        }
    };

    /**
     * Make the player collect collectibles on a given cell
     * @param x {number} integer x-coordinate of the cell
     * @param y {number} integer y-coordinate of the cell
     */
    this.collect = function (x, y) {
        for (let i = 0; i < things.length; i++) {
            let t = things[i];
            if (t.collectible && t.x === x + .5 && t.y === y + .5) {
                if (31 <= t.spriteIndex && t.spriteIndex <= 35) {
                    // treasure or 1up
                    score.treasures += 1;
                    flash = new Flash(.5, .5, 0);  // yellow flash for treasures
                    updateScore();
                } else {
                    // other collectible (ammo, weapon, food or key)
                    flash = new Flash(.5, .5, .5);  // white flash for other collectibles
                    if (t.spriteIndex === 22) {
                        // gold key
                        player.goldKey = true;
                        updateScore();
                    } else if (t.spriteIndex === 23) {
                        // silver key
                        player.silverKey = true;
                        updateScore();
                    }
                }
                things.splice(i, 1);
                i -= 1;
            }
        }
    };

    /**
     * Shoot straight in front of the player (kills the first enemy in the line)
     */
    this.shoot = function () {
        if (this.weaponAnimation === undefined) {
            this.weaponAnimation = new Animation([422, 423, 424, 425]);
            let d = zIndex[pixelWidth / 2];
            for (let i = things.length - 1; i >= 0; i--) {
                let t = things[i];
                if (t.rx < 0) {
                    continue;
                }
                if (t.rx >= d) {
                    break;
                }
                if (Math.abs(t.ry) <= .3 && t.alive) {
                    flash = new Flash(.5, 0, 0);
                    t.die();
                    return;
                }
            }
        }
    };

    this.update = function () {
        // Input handling is now done directly in Sprig onInput() handlers
        // This function can be used for other player updates if needed
        
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({
                'id': netId,
                'x': player.x,
                'y': player.y,
                'dx': player.dx,
                'dy': player.dy,
            }))
        }

        if (this.weaponAnimation !== undefined) {
            let a = this.weaponAnimation;
            a.timer += 1;
            if (a.timer >= 6) {
                a.timer = 0;
                if (a.spriteIndex >= a.sprites.length - 1) {
                    this.weaponAnimation = undefined;
                    this.weaponSprite = 421;
                } else {
                    a.spriteIndex += 1;
                    this.weaponSprite = a.sprites[a.spriteIndex];
                }
            }
        }
    }
}


/**
 * Class representation of the level things (decorations, powerups, enemies, etc.)
 * @param x {number} starting x-coordinate on map
 * @param y {number} starting y-coordinate on map
 * @param spriteIndex {number} index of texture to represent the thing
 * @param collectible {boolean} whether the thing can be collected by the player
 * @param orientable {boolean} whether the thing has different sprites depending on orientation
 * @param blocking {boolean} whether the thing blocks player movement
 * @constructor
 */
function Thing(x, y, spriteIndex, collectible = false, orientable = false, blocking = false) {
    /**
     * Current x-coordinate on map
     * @type {number}
     */
    this.x = x + .5;
    /**
     * Current y-coordinate on map
     * @type {number}
     */
    this.y = y + .5;
    /**
     * Index of sprite texture
     * @type {number}
     */
    this.spriteIndex = spriteIndex;
    /**
     * Whether the thing can be collected by the player (ammunition, weapon, food, treasure, 1up)
     * @type {boolean}
     */
    this.collectible = collectible;
    /**
     * Whether the thing has different sprites depending on orientation
     * @type {boolean}
     */
    this.orientable = orientable;
    /**
     * Whether the thing blocks player movement
     * @type {boolean}
     */
    this.blocking = blocking;

    /**
     * Start executing a sprite animation (change current sprite at regular intervals)
     * @param animation
     */
    this.startAnimation = function (animation) {
        this.animation = animation;
        this.spriteIndex = animation.sprites[0];
    };

    /**
     * Update necessary attributes each frame:
     * - relative coordinates from player's perspective
     * - possible animation values
     */
    this.update = function () {
        /**
         * Relative x-coordinate in the player's reference frame
         * @type {number}
         */
        this.rx = this.x - player.x;
        /**
         * Relative y-coordinate in the player's reference frame
         * @type {number}
         */
        this.ry = this.y - player.y;
        let rx = this.rx * player.dx + this.ry * player.dy;
        this.ry = -this.rx * player.dy + this.ry * player.dx;
        this.rx = rx;

        if (this.animation !== undefined) {
            let a = this.animation;
            a.timer += 1;
            if (a.timer >= 8) {
                a.timer = 0;
                if (a.spriteIndex >= a.sprites.length - 1) {
                    if (a.loop) {
                        // animation loops
                        a.spriteIndex = 0;
                    } else {
                        // animation ended
                        this.animation = undefined;
                    }
                } else {
                    a.spriteIndex += 1;
                }
                this.spriteIndex = a.sprites[a.spriteIndex];
            }
        }
    }
}


/**
 * Class representation of game enemies
 * @param x {number} x-coordinate of the enemy
 * @param y {number} y-coordinate of the enemy
 * @param spriteIndex {number} index of the main sprite for the enemy (if the enemy is orientable, this is the index
 * of the first sprite (front)
 * @param deathSprites {number[]} sprite indexes of the enemy's dying animation
 * @param orientable {boolean} whether or not the enemy has different sprites depending on orientation
 * @param direction {number} facing direction (0: north, 2: east, 4: south, 6: west)
 * @constructor
 */
function Enemy(x, y, spriteIndex, deathSprites, orientable = false, direction = 0) {
    Thing.call(this, x, y, spriteIndex, false, orientable);
    /**
     * List of sprite indexes of the enemy's dying animation
     * @type {number[]}
     */
    this.deathSprites = deathSprites;
    /**
     * Facing direction (0: North, 1: East, 2: South, 3: West)
     * @type {number}
     */
    this.direction = direction;
    /**
     * Whether the enemy is currently alive
     * @type {boolean}
     */
    this.alive = true;

    score.totalKills += 1;

    /**
     * Kill the enemy and start its dying animation
     */
    this.die = function () {
        this.alive = false;
        this.orientable = false;
        this.startAnimation(new Animation(this.deathSprites));
        score.kills += 1;
        updateScore();
        shouldDrawMap = true;
    };
}


/**
 * Standard (brown) guard
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @param direction {number} facing direction
 * @constructor
 */
function GuardEnemy(x, y, direction) {
    Enemy.call(this, x, y, 50, [90, 91, 92, 93, 95], true, direction);
}


/**
 * Dog
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @param direction {number} facing direction
 * @constructor
 */
function DogEnemy(x, y, direction) {
    Enemy.call(this, x, y, 99, [131, 132, 133, 134], true, direction);
}


/**
 * SS (blue) soldier
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @param direction {number} facing direction
 * @constructor
 */
function SSEnemy(x, y, direction) {
    Enemy.call(this, x, y, 138, [179, 180, 181, 183], true, direction);
}


/**
 * Zombie soldier (green)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @param direction {number} facing direction
 * @constructor
 */
function ZombieEnemy(x, y, direction) {
    Enemy.call(this, x, y, 187, [228, 229, 230, 232, 233], true, direction);
}


/**
 * Officer (white)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @param direction {number} facing direction
 * @constructor
 */
function OfficerEnemy(x, y, direction) {
    Enemy.call(this, x, y, 238, [279, 280, 281, 283, 284], true, direction);
}


/**
 * Hans Grösse (boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function HansEnemy(x, y) {
    Enemy.call(this, x, y, 300, [304, 305, 306, 303]);
}


/**
 * Doctor Schabbs (boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function SchabbsEnemy(x, y) {
    Enemy.call(this, x, y, 312, [313, 314, 315, 316]);
}


/**
 * Fake Hitler (flying mini-boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function FakeHitlerEnemy(x, y) {
    Enemy.call(this, x, y, 321, [328, 329, 330, 331, 332, 333]);
}


/**
 * Adolf Hitler (boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function HitlerEnemy(x, y) {
    Enemy.call(this, x, y, 349, [353, 354, 355, 356, 357, 358, 359, 352]);
}


/**
 * Otto Giftmacher (boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function OttoEnemy(x, y) {
    Enemy.call(this, x, y, 364, [366, 367, 368, 369]);
}


/**
 * Gretel Grösse (boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function GretelEnemy(x, y) {
    Enemy.call(this, x, y, 389, [393, 394, 395, 392]);
}


/**
 * General Fettgesicht (boss)
 * @param x {number} x-coordinate
 * @param y {number} y-coordinate
 * @constructor
 */
function FettgesichtEnemy(x, y) {
    Enemy.call(this, x, y, 400, [404, 405, 406, 407]);
}


/**
 * Prepare the level after the map is loaded:
 * - place things
 * - place the player
 * - make the plane2 array of blocking cells
 */
function setupLevel() {
    // setup things
    things = [];
    doorTimers = [];
    wallTimers = [];
    if (player === undefined) {
        player = new Player();
    }
    player.silverKey = false;
    player.goldKey = false;

    score = {
        kills: 0,
        totalKills: 0,
        treasures: 0,
        totalTreasures: 0,
        secrets: 0,
        totalSecrets: 0,
    };
    spriteTextures = [];
    for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
            // structural
            let m0 = map0(x, y);
            if (m0 <= 63) {
                // wall
                plane2[x][y] = true;
            } else if (90 <= m0 && m0 <= 101) {
                // door
                plane2[x][y] = true;
            }
            // entities
            let m1 = map1(x, y);
            if (19 <= m1 && m1 <= 22) {
                // player starting position
                player.x = x + .5;
                player.y = y + .5;
                if (m1 === 19) {
                    player.dx = 0;
                    player.dy = -1;
                } else if (m1 === 20) {
                    player.dx = 1;
                    player.dy = 0;
                } else if (m1 === 21) {
                    player.dx = 0;
                    player.dy = 1;
                } else if (m1 === 22) {
                    player.dx = -1;
                    player.dy = 0;
                }
            } else if (23 <= m1 && m1 <= 70) {
                // props
                let collectible = false;
                if ([29, 43, 44, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56].indexOf(m1) >= 0) {
                    // collectible
                    collectible = true;
                    if (52 <= m1 && m1 <= 56) {
                        score.totalTreasures += 1;
                    }
                }
                if ([24, 25, 26, 28, 30, 31, 33, 34, 35, 36, 39, 40, 41, 45, 58, 59, 60, 62, 63, 68,
                    69].indexOf(m1) >= 0) {
                    // blocking prop
                    things.push(new Thing(x, y, m1 - 21, collectible, false, true));
                    plane2[x][y] = true;
                } else {
                    things.push(new Thing(x, y, m1 - 21, collectible, false, false));
                }
            } else if (m1 === 98) {
                // pushwall
                score.totalSecrets += 1;
            } else if (m1 === 124) {
                // dead guard
                things.push(new Thing(x, y, 95));
            } else if (m1 >= 108) {
                // enemy
                if ((108 <= m1 && m1 < 116)) {
                    things.push(new GuardEnemy(x, y, (m1 - 108) % 4));
                } else if ((144 <= m1 && m1 < 152)) {
                    things.push(new GuardEnemy(x, y, (m1 - 144) % 4));
                } else if ((116 <= m1 && m1 < 124)) {
                    things.push(new OfficerEnemy(x, y, (m1 - 116) % 4));
                } else if ((152 <= m1 && m1 < 160)) {
                    things.push(new OfficerEnemy(x, y, (m1 - 152) % 4));
                } else if ((126 <= m1 && m1 < 134)) {
                    things.push(new SSEnemy(x, y, (m1 - 126) % 4));
                } else if ((162 <= m1 && m1 < 170)) {
                    things.push(new SSEnemy(x, y, (m1 - 162) % 4));
                } else if ((134 <= m1 && m1 < 142)) {
                    things.push(new DogEnemy(x, y, (m1 - 134) % 4));
                } else if ((170 <= m1 && m1 < 178)) {
                    things.push(new DogEnemy(x, y, (m1 - 170) % 4));
                } else if ((216 <= m1 && m1 < 224)) {
                    things.push(new ZombieEnemy(x, y, (m1 - 116) % 4));
                } else if ((234 <= m1 && m1 < 242)) {
                    things.push(new ZombieEnemy(x, y, (m1 - 144) % 4));
                } else if (m1 === 160) {
                    things.push(new FakeHitlerEnemy(x, y));
                } else if (m1 === 178) {
                    things.push(new HitlerEnemy(x, y));
                } else if (m1 === 179) {
                    things.push(new FettgesichtEnemy(x, y));
                } else if (m1 === 196) {
                    things.push(new SchabbsEnemy(x, y));
                } else if (m1 === 197) {
                    things.push(new GretelEnemy(x, y));
                } else if (m1 === 214) {
                    things.push(new HansEnemy(x, y));
                } else if (m1 === 215) {
                    things.push(new OttoEnemy(x, y));
                } else if (224 <= m1 && m1 < 228) {
                    // Ghost
                    let ghost = new Thing(x, y, 0);
                    let spriteIndex = 288 + 2 * (m1 - 224);
                    ghost.startAnimation(new Animation([spriteIndex, spriteIndex + 1], true));
                    things.push(ghost);
                }
            }
        }
    }

    if (!isDrawing) {
        isDrawing = true;
        startGameLoop();
    }

    shouldDrawMap = true;
    updateScore();
}


/**
 * Update all game related elements.
 * This function is called at each frame.
 */
function update() {
    // update things
    for (let i = 0; i < things.length; i++) {
        things[i].update();
    }
    things.sort((a, b) => b.rx - a.rx);

    // update door timers
    for (let i = 0; i < doorTimers.length; i++) {
        let timer = doorTimers[i];
        timer.t += 1;
        if (timer.t >= 64) {
            doorTimers.splice(i, 1);    // remove the timer
            i -= 1; // adjust loop index to compensate for item removal
            if (timer.opening) {
                plane2[timer.x][timer.y] = false;
            }
        }
    }

    // update wall timers
    for (let i = 0; i < wallTimers.length; i++) {
        let timer = wallTimers[i];
        timer.t += 1;
        if (timer.t === 64) {
            let x = timer.x;
            let y = timer.y;
            let dx = timer.dx;
            let dy = timer.dy;
            let wallValue = map0(x, y);
            setMap0(x, y, map0(x - dx, y - dy));
            setMap0(x + dx, y + dy, wallValue);
            setMap1(x, y, 0);
            plane2[x][y] = false;
            plane2[x + dx][y + dy] = true;
            timer.steps -= 1;
            if (timer.steps > 0 && !plane2[x + 2 * dx][y + 2 * dy]) {
                // wall moves one more step
                setMap1(x + dx, y + dy, 98);
                timer.t = 0;
                timer.x += dx;
                timer.y += dy;
            } else {
                // wall finished moving
                doorTimers.splice(i, 1);
                i -= 1;
            }
            shouldDrawMap = true;
        }
    }

    // update player
    player.update();

    // update flashing palette
    if (flash !== undefined) {
        flash.timer += 1;
        if (flash.timer <= flash.duration / 3) {
            flashPalette(flash.red / 2, flash.green / 2, flash.blue / 2);
        } else if (flash.timer <= 2 * flash.duration / 3) {
            flashPalette(flash.red, flash.green, flash.blue);
        } else if (flash.timer <= flash.duration) {
            flashPalette(flash.red / 2, flash.green / 2, flash.blue / 2);
        } else {
            flashPalette(0, 0, 0);
            flash = undefined
        }
    }

    if (fps60) {
        // run at 60fps
        draw();
    } else if (drawNextFrame = !drawNextFrame) {
        // run at 30 fps
        draw();
    }

    // Game loop continues via Sprig's afterInput system
}


/**
 * Load the level after the current one.
 */
function loadNextLevel() {
    loadLevel(currentLevel + 1);
}

function updateGameState(data) {
    const id = data.id;
    if (id !== netId) {
        if (!opponentPlayers.hasOwnProperty(id)) {
            opponentPlayers[id] = new Enemy(0, 0, 238, [279, 280, 281, 283, 284], true, 0);
            things.push(opponentPlayers[id]);
        }
        opponentPlayers[id].x = data.x;
        opponentPlayers[id].y = data.y;
        opponentPlayers[id].direction = (4 * Math.atan2(data.dx, data.dy) / Math.PI + 12) % 8;
    }
}

// adapter over pixels providing a DataView-like API
class PixelView {
  constructor(width, height, buffer) {
    this.width = width
    this.height = height
    this.buffer = buffer
  }
  setUint32(byteOffset, rgba) {
    const i = byteOffset >> 2
    const x = i % this.width, y = (i / this.width) | 0
    // Convert 32-bit RGBA integer to array format for SubTile
    const r = (rgba >> 0) & 0xFF
    const g = (rgba >> 8) & 0xFF  
    const b = (rgba >> 16) & 0xFF
    const a = (rgba >> 24) & 0xFF
    this.buffer.setChar(x, y, Sprite.rgbaToChar([r, g, b, a]))
  }
}

let mouseSensitivity = .3;
/**
 * HTML Canvas in which the game view is drawn
 * @type {HTMLCanvasElement}
 */
let canvas;
/**
 * Drawing context
 * @type {CanvasRenderingContext2D}
 */
let context;
/**
 * Pixel data for the drawing context
 * @type {ImageData}
 */
let imageData;
/**
 * DataView of rendered pixels
 * @type {DataView}
 */
let pixels;

let socket;

function randomString(len) {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++) {
        const r = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(r, r + 1);
    }
    return randomString;
}

const netId = randomString(10);

/**
 * Update the score information under the game screen
 * (should be called whenever one of the score values changes)
 */
function updateScore() {
    // Score display removed for Sprig compatibility
    // Could be implemented with addText() if needed
}




/**
 * Toggle between 60 fps and 30 fps
 */
function toggleFPS() {
    fps60 = !fps60;
    // DOM manipulation removed for Sprig compatibility
}


/**
 * Toggle pushwalls hightlighting on or off
 */
function togglePushwalls() {
    showPushwalls = !showPushwalls;
}


/**
 * Toggle the visibility of the map
 */
function toggleMap() {
    showMap = !showMap;
    // DOM manipulation removed for Sprig compatibility
}


/**
 * Loads a level and starts running the game
 * @param level {number} level to load (should be an integer from 0 to 59)
 */
function startGame(level) {

    renderer = new SubTileRenderer(40, 25) // 320x400 resolution

    gameSurface = new Surface(renderer.pixelWidth, renderer.pixelHeight)
    renderer.addSurface(gameSurface, 0, 0)

    hudSurface = new Surface(256, 256)
    renderer.addSurface(hudSurface, 0, 0)

    pixels = new PixelView(gameSurface.width, gameSurface.height, gameSurface.buffer);

    // display the canvas
    // let gameScreen = document.getElementById("game_screen");
    // canvas = document.createElement("canvas");
    // canvas.id = 'game_canvas';
    // canvas.width = 640;
    // canvas.height = 400;
    // canvas.addEventListener('click', handleClick, false);
    // document.addEventListener('pointerlockchange', handleLockChange, false);
    // context = canvas.getContext("2d", {alpha: false});
    // setZoom(2);  // by default start in 320 x 200 resolution
    // gameScreen.innerHTML = '';
    // gameScreen.appendChild(canvas);

    // canvasHUD = document.createElement("canvas");
    // canvasHUD.id = 'hud_canvas';
    // canvasHUD.style = 'display: none';
    // canvasHUD.width = 256;
    // canvasHUD.height = 256;
    // contextHUD = canvasHUD.getContext("2d");
    // gameScreen.appendChild(canvasHUD);
    
    // Create mock contextHUD for Sprig compatibility (no HTML canvas)
    contextHUD = {
        clearRect: () => {},
        fillStyle: '',
        fillRect: () => {}
    };
    loadResources().then(() => {
        console.log("resources loaded")
        loadLevel(level);
    });

    // Sprig input handlers
    onInput("w", () => {
        player.move(player.speed);
    });
    onInput("s", () => {
        player.move(-player.speed);
    });
    onInput("a", () => {
        player.turn(-player.speed_a);
    });
    onInput("d", () => {
        player.turn(player.speed_a);
    });
    
    onInput("j", () => {
        player.move(0, -player.speed);
    });
    onInput("l", () => {
        player.move(0, player.speed);
    });
    onInput("k", () => {
        player.shoot();
    });
    onInput("i", () => {
        player.activate();
    });
    
    // Additional controls (using other available keys)
    onInput("r", () => {
        //
    });
    onInput("m", () => {
        // 
    });
    onInput("n", () => {
        loadNextLevel();
    });
    
}


/**
 * Function called when user clicks on the game screen canvas
 * (locks mouse pointer if it is not locked, shoots if already locked)
 */
// Mouse handling functions removed for Sprig compatibility


/**
 * React to a movement of the mouse when locked in the game screen canvas
 */
// Mouse movement handling removed for Sprig compatibility


// Initialize game data for Sprig compatibility
function initializeGameData() {
    // Initialize basic game variables
    player = new Player();
    currentLevel = 0;
    score = {
        kills: 0,
        totalKills: 0,
        secrets: 0,
        totalSecrets: 0,
        treasures: 0,
        totalTreasures: 0
    };
    
    // Initialize game state
    fps60 = false;
    showMap = false;
    showPushwalls = false;
    isDrawing = false;
    shouldDrawMap = true;
    
    // Initialize embedded game data (simplified for Sprig)
    // In a full implementation, this would contain the actual Wolfenstein level data
    initializeEmbeddedData();
}

// Initialize embedded game data
function initializeEmbeddedData() {
    // Create minimal game data for Sprig compatibility
    // This is a simplified version - full implementation would embed actual Wolfenstein data
    
    // Initialize basic map data
    plane0 = new Array(64).fill().map(() => new Array(64).fill(0));
    plane1 = new Array(64).fill().map(() => new Array(64).fill(0));
    plane2 = new Array(64).fill().map(() => new Array(64).fill(false));
    
    // Create a simple test level
    for (let x = 0; x < 64; x++) {
        for (let y = 0; y < 64; y++) {
            if (x === 0 || x === 63 || y === 0 || y === 63) {
                plane0[x][y] = 1; // Wall
                plane2[x][y] = true; // Blocking
            }
        }
    }
    
    // Set player starting position
    player.x = 32;
    player.y = 32;
    player.dx = 1;
    player.dy = 0;
}

// Initialize game directly for Sprig compatibility
function initializeGame() {
    // Initialize game data (embedded instead of loaded)
    initializeGameData();
    
    // Start the first level directly
    startGame(0);
}

// Start the game loop using Sprig's afterInput system
function startGameLoop() {
    afterInput(() => {
        if (isDrawing) {
            update();
        }
    });
}

// Initialize the game when script loads
initializeGame();

function connect(gid) {
    socket = new WebSocket(`ws://games.zanapher.fr/cs/wolf_${gid}/`);
    socket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        updateGameState(data);
    }
}