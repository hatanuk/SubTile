
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
    
    // Mark the corresponding tile as dirty in the renderer
    if (renderer) {
      const tx = Math.floor(x / renderer.TILESIZE)
      const ty = Math.floor(y / renderer.TILESIZE)
      renderer.markDirty({tx, ty})
    }
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