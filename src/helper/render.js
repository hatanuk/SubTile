function blit(sourceBuffer, destBuffer, sourceWidth, sourceHeight, destWidth, destHeight, x=0, y=0) {
  

  if (x < 0) {
    sourceWidth += x; // shrink copy width
    x = 0;
  }
  if (y < 0) {
    sourceHeight += y; // shrink copy height
    y = 0;
  }
  
  if (x + sourceWidth > destWidth) {
    sourceWidth = destWidth - x;
  }
  if (y + sourceHeight > destHeight) {
    sourceHeight = destHeight - y;
  }



  const maxHeight = Math.min(sourceHeight, destHeight - y)

  for (let srcRowY = 0; srcRowY < maxHeight; srcRowY++) {

    let curDestX = x;
    let curSrcX = 0;
    let remainingWidth = sourceWidth;
    const destRowY = y + srcRowY;

    const sameParity = ((curDestX & 1) === (curSrcX & 1))


    if (!sameParity) {
      // could implement nibble stitching, but currently just snaps blit to the nearest byte boundary
      curDestX = Math.max(0, curDestX - 1);
    }

    // prologue: align to byte boundary if starting on odd pixel
    if (curDestX & 1) {

      const destBufferIndex = getBufferIndex(curDestX, destRowY, destWidth)
      const sourceBufferIndex = getBufferIndex(curSrcX, srcRowY, sourceWidth)
      
      // write to the high nibble
      destBuffer.setValue(destBufferIndex, sourceBuffer.getValue(sourceBufferIndex))

      curDestX++;
      curSrcX++;
      remainingWidth--;
    }

    // middle: mass copy
  const fullBytes = remainingWidth >> 1
  if (fullBytes > 0) {

    const destBufferIndex = getBufferIndex(curDestX, destRowY, destWidth)
    const sourceBufferIndex = getBufferIndex(curSrcX, srcRowY, sourceWidth)
    const dStart = destBuffer.pixels.getByteIndex(destBufferIndex)
    const sStart = sourceBuffer.pixels.getByteIndex(sourceBufferIndex)

    destBuffer.pixels.values.set(
      sourceBuffer.pixels.values.subarray(sStart, sStart + fullBytes),
      dStart
    )
  }

  if (remainingWidth & 1) {
    // epilogue: fix last byte
    const destLastIndex = curDestX + --remainingWidth
    const srcLastIndex = curSrcX + remainingWidth
    // write to the low nibble
    destBuffer.setValue(destLastIndex, sourceBuffer.getValue(srcLastIndex))
  }

  }
}


function getBufferIndex(x, y, width) {
  return x + y * width
}