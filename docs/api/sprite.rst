Sprite
======

Represents a graphical sprite that can be drawn to surfaces. Sprites store pixel data as palette indices (0-15) that correspond to Sprig's 16-color palette.

Constructor
-----------

.. code-block:: javascript

   new Sprite(byteArray, width, height, bitDepth = 8)

**Parameters:**

- ``byteArray`` (Uint8Array): Array of palette indices (0-15) representing the image's pixels (from top-left to bottom-right)
- ``width`` (number): Width of the sprite in pixels
- ``height`` (number): Height of the sprite in pixels
- ``bitDepth`` (number): Bit depth of the input data (default: 8)

Properties
----------

width
~~~~~

The width of the sprite in pixels.

height
~~~~~~

The height of the sprite in pixels.

bitDepth
~~~~~~~~

The bit depth of the sprite data.

data
~~~~

The Uint8Array containing palette indices (0-15) for each pixel.

Methods
-------

getBitmap()
~~~~~~~~~~~

Returns a string representation of the sprite using Sprig's character mapping.

**Returns:** (string) A string where each character represents a pixel

fromBase64RGBA(base64, width, height, inputBitDepth = 8)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Static method to create a sprite from Base64-encoded RGBA data.

**Parameters:**

- ``base64`` (string): Base64-encoded RGBA image data
- ``width`` (number): Width of the image
- ``height`` (number): Height of the image
- ``inputBitDepth`` (number): Bit depth of the input data (default: 8)

**Returns:** (Sprite) A new Sprite instance

Static Methods
--------------

rgbaToChar(rgbaValues)
~~~~~~~~~~~~~~~~~~~~~~

Converts RGBA values to a Sprig character.

**Parameters:**

- ``rgbaValues`` (Array): Array of [R, G, B, A] values (0-255)

**Returns:** (string) The corresponding Sprig character

Color Palette
-------------

The sprite uses Sprig's 16-color palette:

.. code-block:: javascript

   const colorMap = {
       0: [0.0,   0.0,   0.0],    // Black
       1: [0.282, 0.314, 0.337],  // Dark gray
       2: [0.569, 0.592, 0.608],  // Light gray
       3: [0.973, 0.976, 0.980],  // White
       4: [0.922, 0.286, 0.392],  // Red
       5: [0.545, 0.251, 0.184],  // Brown
       6: [0.102, 0.694, 0.976],  // Light blue
       7: [0.071, 0.078, 0.878],  // Blue
       8: [0.996, 0.906, 0.059],  // Yellow
       9: [0.580, 0.549, 0.200],  // Dark yellow
       10: [0.176, 0.878, 0.243], // Light green
       11: [0.110, 0.584, 0.059], // Green
       12: [0.957, 0.424, 0.733], // Pink
       13: [0.667, 0.227, 0.773], // Purple
       14: [0.957, 0.439, 0.090], // Orange
       15: [1.0, 1.0, 1.0]        // Transparent/White
   }

Character Mapping
-----------------

Each palette index maps to a specific character:

.. code-block:: javascript

   const charMap = {
       0: "0", 1: "L", 2: "1", 3: "2",
       4: "3", 5: "C", 6: "7", 7: "5",
       8: "6", 9: "F", 10: "4", 11: "D",
       12: "8", 13: "H", 14: "9", 15: "."
   }

Examples
--------

Creating a sprite from palette data:

.. code-block:: javascript

   // Create a 2x2 sprite with palette indices
   let paletteData = new Uint8Array([4, 6, 10, 15]); // Red, Light Blue, Light Green, Transparent
   let sprite = new Sprite(paletteData, 2, 2);
   
   // Draw it on a surface
   surface.drawSprite(10, 10, sprite);

Creating a sprite from Base64 RGBA data:

.. code-block:: javascript

   // Assuming you have Base64-encoded RGBA data
   let base64Data = "SGVsbG8gV29ybGQh...";
   let sprite = Sprite.fromBase64RGBA(base64Data, 32, 32);
   
   // Draw it on a surface
   surface.drawSprite(10, 10, sprite);

Converting RGBA values to characters:

.. code-block:: javascript

   // Convert RGB values to a character
   let char = Sprite.rgbaToChar([255, 0, 0, 255]); // Red pixel
   console.log(char); // Outputs: "3"

Getting sprite as bitmap string:

.. code-block:: javascript

   let sprite = new Sprite(new Uint8Array([4, 6, 10, 15]), 2, 2);
   let bitmap = sprite.getBitmap();
   console.log(bitmap);
   // Outputs:
   // "36\n4.\n"
