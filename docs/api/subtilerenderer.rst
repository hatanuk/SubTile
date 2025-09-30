SubTileRenderer
==============

The main class that controls frame-by-frame rendering to the screen.

Constructor
-----------

.. code-block:: javascript

   new SubTileRenderer(screenTileWidth = 10, screenTileHeight = 8)

**Parameters:**

- ``screenTileWidth`` (number): Width of the screen in tiles (default: 10)
- ``screenTileHeight`` (number): Height of the screen in tiles (default: 8)

.. note::
   Each tile is 16×16 pixels. The default 10×8 tiles = 160×128 pixels, which is Sprig's native resolution.

Methods
-------

addSurface(surface, x = 0, y = 0)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Adds a surface to the renderer at the specified position.

**Parameters:**

- ``surface`` (Surface): The surface object to add
- ``x`` (number): X coordinate to position the surface (default: 0)
- ``y`` (number): Y coordinate to position the surface (default: 0)

beginFrame()
~~~~~~~~~~~~

Begins a new frame by clearing the dirty tile bucket. Call this at the start of each frame.

endFrame()
~~~~~~~~~~

Ends the frame by rendering all surfaces and updating dirty tiles. Call this after all drawing operations.

removeSurface(surface)
~~~~~~~~~~~~~~~~~~~~~~

Removes a surface from the renderer.

**Parameters:**

- ``surface`` (Surface): The surface object to remove

clearAll()
~~~~~~~~~~

Clears the main buffer and marks all tiles as dirty.

applyTransformation(surface, {scaleX = 1, scaleY = 1, xOffset, yOffset})
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Applies transformations to a surface.

**Parameters:**

- ``surface`` (Surface): The surface to transform
- ``scaleX`` (number): Horizontal scale factor (default: 1)
- ``scaleY`` (number): Vertical scale factor (default: 1)
- ``xOffset`` (number): X offset (defaults to current surface offset)
- ``yOffset`` (number): Y offset (defaults to current surface offset)

Example
-------

.. code-block:: javascript

   let renderer = new SubTileRenderer(10, 8); // 160x128 pixels
   let surface = new Surface(160, 128);
   
   renderer.beginFrame();
   renderer.addSurface(surface, 0, 0);
   surface.drawRect(10, 10, 20, 20, "1");
   renderer.endFrame();
