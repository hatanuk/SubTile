function blit(sourceBuffer, destBuffer, copyWidth, copyHeight, x=0, y=0) {
  
  // amount of pixels to jump before reaching the next row 
  const srcStride = sourceBuffer.width
  const destStride = destBuffer.width

  const destWidth = destBuffer.width
  const destHeight = destBuffer.height

  // these are offsets within the source
  let sx = 0
  let sy = 0

   if (x < 0) {
    sx = -x
    copyWidth += x
    x = 0
  }
  if (y < 0) {
    sy = -y
    copyHeight += y
    y = 0
  }
  if (x + copyWidth > destWidth) {
    copyWidth = destWidth - x
  }
  if (y + copyHeight > destHeight) {
    copyHeight = destHeight - y
  }
  if (copyWidth <= 0 || copyHeight <= 0) return
  
  const maxHeight = Math.min(copyHeight, destHeight - y);


  for (let row = 0; row < maxHeight; row++) {
    let curDestX = x
    let curSrcX = sx
    let remainingWidth = copyWidth

    const destRowY = y + row
    const srcRowY = sy + row

    const sameParity = ((curDestX & 1) === (curSrcX & 1))

    if (!sameParity) {
      // could implement nibble stitching, but currently just snaps blit to the nearest byte boundary
      curSrcX++
      remainingWidth--
      if (remainingWidth <= 0) continue
    }

    // prologue: align to byte boundary if starting on odd pixel
    if (curDestX & 1) {

      const destBufferIndex = getBufferIndex(curDestX, destRowY, destStride)
      const sourceBufferIndex = getBufferIndex(curSrcX, srcRowY, srcStride)
      
      // write to the high nibble
      destBuffer.pixels.setValue(destBufferIndex, sourceBuffer.pixels.getValue(sourceBufferIndex))

      curDestX++;
      curSrcX++;
      remainingWidth--;
    }

    // middle: mass copy
  const fullBytes = remainingWidth >> 1
  if (fullBytes > 0) {

    const destBufferIndex = getBufferIndex(curDestX, destRowY, destStride)
    const sourceBufferIndex = getBufferIndex(curSrcX, srcRowY, srcStride)
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
    // write to the low 