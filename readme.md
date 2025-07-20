# SubTile Sprig Renderer

An arbitrary pixel renderer engine for the game creation platform [Sprig](https://sprig.hackclub.com/) that circumvents the tile-based restrictions of its editor.

Currently, the renderer supports the creation of multiple canvases which can be transformed, as well as the drawing of basic shapes and sprites represented as RGB arrays (see below).

> **Note:** This was created as a project for [Shipwrecked](https://shipwrecked.hackclub.com/bay) to gain familiarity with JavaScript and graphical programming. You may find it helpful, but expect inefficiencies and quirks.

---

## Example Usage

### Creating a renderer, canvas, and drawing a rectangle
```js
let renderer = new SubTileRenderer(160, 128);
let canvas = new Canvas(0, 0, 160, 128);
renderer.addCanvas(0, 0, canvas);
canvas.drawRect(0, 0, 10, 10, "2");
renderer.renderFrame();
```

### Creating a renderer, canvas, and drawing a sprite
```js
let spriteOneRGB = [164, 255, 0, 164, 255, 0 /* ... */];

let renderer = new SubTileRenderer(160, 128);
let canvas = new Canvas(0, 0, 160, 128);
renderer.addCanvas(0, 0, canvas);

let spriteOne = new Sprite(spriteOneRGB, 64, 64);
canvas.drawer.drawSprite(0, 0, spriteOne);

renderer.renderFrame();
```

---

## `SubTileRenderer`
The main object that controls frame-by-frame rendering to the screen.

### Constructor
```js
new SubTileRenderer(screenWidth, screenHeight)
```
> Sprig’s native screen resolution is 160×128, which is the recommended `screenWidth` and `screenHeight`.

---

## `Canvas`
A canvas represents a drawable window within the renderer. A forward pass maps each pixel drawn using the canvas’s local pixel coordinates to the global screen coordinates. This is performed using affine transformation matrices.

You can scale or offset the canvas using the `x`, `y`, `scaleX`, and `scaleY` arguments when adding a canvas to the renderer using:

```js
SubTileRenderer.addCanvas(x, y, canvas, scaleX = 1, scaleY = 1)
```

### Constructor
```js
new Canvas(width, height)
```

---

## `CanvasDrawer`
Accessed via the `drawer` property of a `Canvas` instance.

### Methods
- `drawPixel(x, y, char)`
- `drawRect(x, y, rectWidth, rectHeight, char)`
- `drawCircle(cx, cy, radius, char)`
- `clearRect(x, y, width, height)`
- `drawSprite(x, y, sprite)`

> These methods are also accessible directly from the `Canvas` instance, e.g., `canvas.drawRect(...)`.

---

## `Sprite`

### Constructor
```js
new Sprite(rgbArray, width, height)
```

- Accepts a 1D array of RGB values representing the image’s pixels (from top-left to bottom-right).
- RGB values are automatically mapped to Sprig’s 16-bit color palette.
- Since Sprig allows only one JavaScript file, it is recommended to define these arrays at the top or bottom of your file.

### Drawing a Sprite
```js
let sprite = new Sprite(rgbArray, 64, 64);
canvas.drawSprite(x, y, sprite);
```

---
