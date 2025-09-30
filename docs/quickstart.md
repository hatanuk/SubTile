# Quick Start Guide

## Basic Setup

Ensure that the minified SubTile code exists in your Sprig JS file(:doc:`installation`)

Then, create a renderer and a surface to draw on:

```javascript
// Create a renderer with Sprig's native resolution (10x8 tiles = 160x128 pixels)
let renderer = new SubTileRenderer(10, 8);

// Create a surface to draw on
let surface = new Surface(160, 128);

// Add the surface to the renderer
renderer.addSurface(surface, 0, 0);
```

## Drawing Basic Shapes

### Rectangle
```javascript
// Draw a 10x10 rectangle at position (0, 0) with character "2"
surface.drawRect(0, 0, 10, 10, "2");
```

### Circle
```javascript
// Draw a circle with radius 5 at center (20, 20) with character "3"
surface.drawCircle(20, 20, 5, "3");
```

### Pixel
```javascript
// Draw a single pixel at (5, 5) with character "1"
surface.drawPixel(5, 5, "1");
```

## Working with Sprites

### Creating a Sprite
```javascript
// Create a sprite from Base64 RGBA data
let spriteBase64 = "//8AAP//AAD//wAA//8AAP//AAD//wAA"; // 4x4 RGBA data
let sprite = Sprite.fromBase64RGBA(spriteBase64, 4, 4);

// Or create from palette data directly
let paletteData = new Uint8Array([4, 6, 10, 15]); // Red,  Blue, Green, Alpha
let sprite2 = new Sprite(paletteData, 2, 2);
```

### Drawing a Sprite
```javascript
// Draw the sprite at position (10, 10)
surface.drawSprite(10, 10, sprite);
```

## Rendering

To actually display your graphics on screen, use the frame rendering pattern:

```javascript
// Begin the frame
renderer.beginFrame();

// Draw your graphics here
surface.drawRect(10, 10, 20, 20, "1");

// End the frame to display
renderer.endFrame();
```

## Complete Example

Here's a complete working example:

```javascript
// Create renderer and surface
let renderer = new SubTileRenderer(10, 8); // 160x128 pixels
let surface = new Surface(160, 128);
renderer.addSurface(surface, 0, 0);

// Begin frame
renderer.beginFrame();

// Draw some basic shapes
surface.drawRect(10, 10, 20, 20, "1");
surface.drawCircle(50, 50, 10, "2");
surface.drawPixel(80, 80, "3");

// End frame to display
renderer.endFrame();
```

## Next Steps

- Check out the :doc:`examples` for more advanced usage
- Read the :doc:`api/index` for detailed API documentation
- Explore the demo files in the `demo/` directory for inspiration
