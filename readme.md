# SubTile Sprig Renderer
An arbitrary pixel renderer engine for game creation platform [Sprig](https://sprig.hackclub.com/) which circumvents the tile based restrictions of its editor.

Currently, the renderer supports the creation of multiple canvases which can be transformed, as well as the drawing of basic shapes and sprites represented as RGB arrays [see below].

    Note: This was created as a project for [Shipwrecked](https://shipwrecked.hackclub.com/bay) to gain familiarity with Javascript and graphical programming. I you'll find it helpful; but expect inefficiencies and quirks. *


## Example Usage

**Creating a renderer, canvas and drawing a rectangle.**
` let renderer = new PixelRenderer(160, 128)
let canvas = new Canvas(0, 0, 160, 128)
renderer.addCanvas(0, 0, canvas) 
canvas.drawRect(0, 0, 10, 10, "2")
renderer.renderFrame() `

**Creating a renderer, canvas and drawing a sprite.**
` 
spriteOneRGB = [164, 255, 0, 164, 255, 0 ...]

let renderer = new PixelRenderer(160, 128)
let canvas = new Canvas(0, 0, 160, 128)
renderer.addCanvas(0, 0, canvas)

let spriteOne = new Sprite(spriteOneRGB, 64, 64)
canvas.drawer.drawSprite(0, 0, spriteOne)

renderer.renderFrame() `

## PixelRenderer
Main object which controls frame-by-frame rendering processes to the screen.

### Constructor
` PixelRenderer(screenWidth, screenHeight) `
    Note: Sprig's native screen resolution is 160x128, which is the recommended **screenWidth** and **screenHeight** argument.


## Canvas
A canvas represents a drawable window within the renderer. A forward pass is performed which maps each pixel drawn using the canvas' local pixel coordinates to the global coordinates of the screen. This is performed using an affine transformation matrices, and the canvas is able to be scaled/offset by changing the **x**, **y**, **scaleX** and **scaleY** arguments when adding a canvas to the renderer using the **PixelRenderer.addCanvas(x, y, canvas, scaleX=1, scaleY=1)** method.

### Constructor
` Canvas(width, height) `

## CanvasDrawer
Referenced by Canvas instances through the **Canvas.drawer** property.
Currently implements the following methods:

` drawPixel(x, y, char) `
` drawRect(x, y, rectWidth, rectHeight, char) `
` drawCircle(cx, cy, radius, char) `
` clearRect(x, y, width, height) `
` drawSprite(x, y, sprite)`

Performance is dependent on the number of pixels drawn.
These methods are accessible in all Canvas instance, i.e. you can directly call **canvas.drawRect()** rather than calling **Canvas.drawer.drawRect()**

## Sprite

### Constructor
` Sprite(rgbArray, width, height) `

The Sprite objects accepts a 1D array of RGB values of an images' pixels (top left to bottom right).
The RGB values are automatically mapped to Sprig's 16-bit color pallette.
Since Sprig is limited to one JS file, it is recommended to predefine these arrays at the top (or bottom) of your file.
A sprite can then be drawn using the **CanvasDrawer** method **drawSprite(x, y, sprite)**:

` let sprite = new Sprite(rgbArray, 64, 64)
canvas.drawer.drawSprite(x, y, sprite) `


