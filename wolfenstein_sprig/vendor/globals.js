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