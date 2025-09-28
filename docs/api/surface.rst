Surface
=======

A surface represents a drawable area within the renderer.
If no scaling/rotation transformations are applied, the pixels of a surface are directly blitted to the main buffer of the renderer. This is efficient.
Otherwise, a forward pass maps each pixel drawn using the surface's local pixel coordinates to the global screen coordinates using affine transformation matrices, which is more expensive.
In other words, limit surface transformations to offsets if performance is vital.

Note about blitting: Due to PackedArray storing two nibbles within a single UInt8Array element, blitting is done only on even offsets. 
This means that blitting a surface with an odd offset (eg. renderer.addSurface(surface, 1, 0)) will cause the surface to snap to the nearest left pixel.
This is not a bug, but an optimization. This may be changed in the future if pixel perfect offsets are required.

Constructor
-----------

.. code-block:: javascript

   new Surface(width, height)

**Parameters:**

- ``width`` (number): Width of the surface in pixels
- ``height`` (number): Height of the surface in pixels

Properties
----------

drawer
~~~~~~

The Drawer instance for this surface. Provides access to drawing methods.

Methods
-------

drawPixel(x, y, char)
~~~~~~~~~~~~~~~~~~~~~

Draws a single pixel at the specified coordinates.

**Parameters:**

- ``x`` (number): X coordinate
- ``y`` (number): Y coordinate
- ``char`` (string): Character to draw

drawRect(x, y, width, height, char)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Draws a rectangle with the specified dimensions.

**Parameters:**

- ``x`` (number): X coordinate of top-left corner
- ``y`` (number): Y coordinate of top-left corner
- ``width`` (number): Width of the rectangle
- ``height`` (number): Height of the rectangle
- ``char`` (string): Character to fill the rectangle with

drawCircle(cx, cy, radius, char)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Draws a circle with the specified center and radius.

**Parameters:**

- ``cx`` (number): X coordinate of center
- ``cy`` (number): Y coordinate of center
- ``radius`` (number): Radius of the circle
- ``char`` (string): Character to fill the circle with

clearRect(x, y, width, height)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Clears a rectangular area of the surface.

**Parameters:**

- ``x`` (number): X coordinate of top-left corner
- ``y`` (number): Y coordinate of top-left corner
- ``width`` (number): Width of the area to clear
- ``height`` (number): Height of the area to clear

drawSprite(x, y, sprite)
~~~~~~~~~~~~~~~~~~~~~~~~

Draws a sprite at the specified position.

**Parameters:**

- ``x`` (number): X coordinate to draw the sprite
- ``y`` (number): Y coordinate to draw the sprite
- ``sprite`` (Sprite): The sprite object to draw

Example
-------

.. code-block:: javascript

   let surface = new Surface(160, 128);
   
   // Draw basic shapes
   surface.drawPixel(10, 10, "1");
   surface.drawRect(20, 20, 30, 20, "2");
   surface.drawCircle(50, 50, 15, "3");
   
   // Clear an area
   surface.clearRect(0, 0, 50, 50);
