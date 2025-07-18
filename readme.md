# SubTile Sprig Renderer
An arbitrary pixel renderer engine for game creation platform [Sprig](https://sprig.hackclub.com/) which circumvents the tile based restrictions of its editor.

Currently, the renderer supports the creation of multiple canvases which can be transformed, as well as the drawing of basic shapes and sprites represented as RGB arrays [see below].

    Note: This was created as a project for [Shipwrecked](https://shipwrecked.hackclub.com/bay) to gain familiarity with Javascript and graphical programming. I you'll find it helpful; but expect inefficiencies and quirks. *


## Example Usage

**Creating a renderer, canvas and drawing a rectangle.**
` let renderer = new PixelRenderer(160, 128)
let canvas = new Canvas(0, 0, 160, 128)
renderer.addCanvas(canvas) 
canvas.drawer.drawRect(0, 0, 10, 10, "2")
renderer.renderFrame() `

**Creating a renderer, canvas and drawing a sprite.**
` 
spriteOneRGB = [164, 255, 0, 164, 255, 0 ...]

let renderer = new PixelRenderer(160, 128)
let canvas = new Canvas(0, 0, 160, 128)
renderer.addCanvas(canvas)

let spriteOne = new Sprite(spriteOneRGB, 64, 64)
canvas.drawer.drawSprite(0, 0, spriteOne)

renderer.renderFrame() `

## PixelRenderer
Main object which controls frame-by-frame rendering processes to the screen.

### Constructor
` PixelRenderer(screenWidth, screenHeight) `
    Note: Sprig's native screen resolution is 160x128, which is the recommended **screenWidth** and **screenHeight** argument.


## Canvas
A canvas represents a drawable window within the renderer. A forward pass is performed which maps each pixel drawn using the canvas' local pixel coordinates to the global coordinates of the screen. This is performed using an affine transformation matrices, and the canvas is able to be scaled by changing the **scaleX** and **scaleY** arguments.

Canvases can be added to a renderer using the **PixelRenderer.addCanvas(canvas)** method.

### Constructor
` Canvas(x, y, width, height, scaleX=1, scaleY=1) `

## CanvasDrawer

## Sprite

### Constructor
` Sprite(rgbArray, width, height) `

The Sprite objects accepts a 1D array of RGB values of an images' pixels (top left to bottom right).
The RGB values are automatically mapped to Sprig's 16-bit color pallette.
Since Sprig is limited to one JS file, it is recommended to predefine these arrays at the top (or bottom) of your file.
A sprite can then be drawn using the **CanvasDrawer** method **drawSprite(x, y, sprite)**:

` let sprite = new Sprite(rgbArray, 64, 64)
canvas.drawer.drawSprite(x, y, sprite) `


