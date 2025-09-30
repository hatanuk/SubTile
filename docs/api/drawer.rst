Drawer
======

The Drawer class provides low-level drawing methods for pixel manipulation. It's accessed via the ``drawer`` property of a Surface instance, and all its methods are automatically bound to the Surface for convenience.

Access
------

.. code-block:: javascript

   let surface = new Surface(160, 128);
   let drawer = surface.drawer;
   
   // All drawer methods are automatically bound to the surface
   surface.drawPixel(10, 10, "1");
   // is equivalent to
   surface.drawer.drawPixel(10, 10, "1");

Constructor
-----------

.. code-block:: javascript

   new Drawer(buffer)

**Parameters:**

- ``buffer`` (Buffer): The buffer object that stores pixel data

Properties
----------

buffer
~~~~~~

The Buffer instance that stores the pixel data.

width
~~~~~

The width of the drawing area (inherited from buffer).

height
~~~~~~

The height of the drawing area (inherited from buffer).

Methods
-------

drawPixel(x, y, char)
~~~~~~~~~~~~~~~~~~~~~

Draws a single pixel at the specified coordinates. 

**Parameters:**

- ``x`` (number): X coordinate
- ``y`` (number): Y coordinate
- ``char`` (string): Character to draw

drawRect(x, y, rectWidth, rectHeight, char)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Draws a filled rectangle with the specified dimensions. 

**Parameters:**

- ``x`` (number): X coordinate of top-left corner
- ``y`` (number): Y coordinate of top-left corner
- ``rectWidth`` (number): Width of the rectangle
- ``rectHeight`` (number): Height of the rectangle
- ``char`` (string): Character to fill the rectangle with

**Implementation Notes:**
- Automatically clips to buffer boundaries
- Uses nested loops for efficient pixel setting

drawCircle(cx, cy, radius, char)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Draws a filled circle with the specified center and radius.

**Parameters:**

- ``cx`` (number): X coordinate of center
- ``cy`` (number): Y coordinate of center
- ``radius`` (number): Radius of the circle (minimum 1)
- ``char`` (string): Character to fill the circle with

drawLine(x0, y0, x1, y1, char)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Draws a line between two points using Bresenham's line algorithm.

**Parameters:**

- ``x0`` (number): X coordinate of start point
- ``y0`` (number): Y coordinate of start point
- ``x1`` (number): X coordinate of end point
- ``y1`` (number): Y coordinate of end point
- ``char`` (string): Character to draw the line with

clearRect(x, y, width, height)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Clears a rectangular area by setting all pixels to "." (empty bitmap).

**Parameters:**

- ``x`` (number): X coordinate of top-left corner
- ``y`` (number): Y coordinate of top-left corner
- ``width`` (number): Width of the area to clear
- ``height`` (number): Height of the area to clear

**Implementation:**
This method internally calls ``drawRect(x, y, width, height, ".")``

clearCanvas()
~~~~~~~~~~~~~

Clears the entire drawing buffer by resetting all pixel values.

**Implementation:**
This method calls ``buffer.clear()`` which resets all pixels in the PackedArray.

drawSprite(x, y, sprite)
~~~~~~~~~~~~~~~~~~~~~~~~

Draws a sprite at the specified position. The sprite's palette indices are mapped to characters using the sprite's internal character array.

**Parameters:**

- ``x`` (number): X coordinate to draw the sprite
- ``y`` (number): Y coordinate to draw the sprite
- ``sprite`` (Sprite): The sprite object to draw

Buffer Integration
------------------

The Drawer works with a Buffer object that uses a PackedArray for efficient memory usage. The Buffer provides:

- ``setChar(x, y, char)``: Sets a character at coordinates
- ``getChar(x, y)``: Gets a character at coordinates  
- ``isInBounds(x, y)``: Checks if coordinates are within bounds
- ``clear()``: Resets all pixel values

Example
-------

.. code-block:: javascript

   let surface = new Surface(160, 128);
   
   // Draw basic shapes (methods are bound to surface)
   surface.drawPixel(10, 10, "1");
   surface.drawRect(20, 20, 30, 20, "2");
   surface.drawCircle(50, 50, 15, "3");
   surface.drawLine(0, 0, 100, 100, "4");
   
   // Clear areas
   surface.clearRect(0, 0, 50, 50);
   surface.clearSurface(); 
   
   // Draw a sprite

   const RGBABase64Data = "SGVsbG8gV29ybGQh...";
   let sprite = Sprite.fromBase64RGBA(base64Data, 32, 32);
   surface.drawSprite(80, 60, sprite);
