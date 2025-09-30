# Examples

Here are some practical examples showing how to use SubTile Sprig Renderer in your games.

## Basic Drawing Example

```javascript
let renderer = new SubTileRenderer(10, 8); // 160x128 pixels
let surface = new Surface(160, 128);
renderer.addSurface(surface, 0, 0);

renderer.beginFrame();

// Draw a simple pattern
for (let x = 0; x < 160; x += 10) {
    for (let y = 0; y < 128; y += 10) {
        surface.drawPixel(x, y, "1");
    }
}

renderer.endFrame();
```

## Multiple Surfaces Example

```javascript
let renderer = new SubTileRenderer(10, 8); // 160x128 pixels

// Create multiple surfaces
let background = new Surface(160, 128);
let foreground = new Surface(80, 64);

renderer.beginFrame();

// Add surfaces with different positions
renderer.addSurface(background, 0, 0);
renderer.addSurface(foreground, 40, 32);

// Draw on background
background.drawRect(0, 0, 160, 128, "1");

// Draw on foreground
foreground.drawCircle(40, 32, 20, "2");

renderer.endFrame();
```

## Sprite Animation Example

```javascript
let renderer = new SubTileRenderer(10, 8); // 160x128 pixels
let surface = new Surface(160, 128);
renderer.addSurface(surface, 0, 0);

// Create sprites from Base64 RGBA data
// Frame 1: Red, Green, Blue pixels
let frame1Base64 = "//8AAAD//wAAAP//AA=="; // 3x1 RGBA data
// Frame 2: Green, Red, Green pixels  
let frame2Base64 = "//8AAP//AAD//wAA"; // 3x1 RGBA data

let frame1 = Sprite.fromBase64RGBA(frame1Base64, 3, 1);
let frame2 = Sprite.fromBase64RGBA(frame2Base64, 3, 1);

let currentFrame = 0;
let frameCount = 0;

// Animation loop (in your game loop)
function animate() {
    renderer.beginFrame();
    surface.clearRect(0, 0, 160, 128);
    
    if (frameCount % 10 === 0) {
        currentFrame = 1 - currentFrame; // Toggle between 0 and 1
    }
    
    let sprite = currentFrame === 0 ? frame1 : frame2;
    surface.drawSprite(80, 64, sprite);
    
    renderer.endFrame();
    frameCount++;
}
```

## Particle System Example

```javascript
let renderer = new SubTileRenderer(10, 8); // 160x128 pixels
let surface = new Surface(160, 128);
renderer.addSurface(surface, 0, 0);

let particles = [];

// Create particles
for (let i = 0; i < 20; i++) {
    particles.push({
        x: Math.random() * 160,
        y: Math.random() * 128,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 60
    });
}

// Update and draw particles
function updateParticles() {
    renderer.beginFrame();
    surface.clearRect(0, 0, 160, 128);
    
    for (let particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life > 0) {
            surface.drawPixel(Math.floor(particle.x), Math.floor(particle.y), "3");
        }
    }
    
    renderer.endFrame();
}
```

## Raycasting Example

Check out the `demo/raycaster.js` file for a complete raycasting implementation that demonstrates advanced usage of the SubTile renderer for creating 3D-like graphics in 2D.

## Notes

1. **Transformations**: Transformations, not including offsets, cause each pixel to be forward mapped to the renderer's main buffer. This means scaling and rotation operations on a surface significantly increase its drawing time. Keep transformations restricted to offsets if performance is vital.
2. **Scaling**: Scaling a surface above the size of 1 does not fill missing pixels, so the resulting image will be fragmented. This can be solved by implementing interpolation (eg. nearest neighbor) but this hasn't been done yet.
3. **Transparency**: Sprig does not support different levels of transparency, so the alpha value for sprites is handled via a simple check: if the alpha is below 50%, a fully transparent "." pixel is drawn, otherwise the mapped color from the RGB values is drawn.