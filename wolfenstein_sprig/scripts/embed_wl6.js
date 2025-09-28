// Since the Sprig web editor does not support file handling, the binary data within Wolf
// .WL6 files is converted to UInt8Arrays which are embeded as an object in the file itself

const fs = require("fs")
const path = require('path');

const dataPath = process.argv[2]
const outputPath = process.argv[3]
if (!dataPath || !outputPath) {
  console.error("Usage: node embed_wl6.js path/to/data/dir path/to/output.js")
  process.exit(1)
}

const dataFiles = fs.readdirSync(dataPath)

let output = 'const EMBED_BYTES = {\n'

dataFiles.forEach((file, i) => {
  const bytes = fs.readFileSync(`${dataPath}/${file}`)
  output +=  `"data/${file}": new Uint8Array([${bytes.join(',')}])`

  if (!(i === dataFiles.length - 1)) {output += ',\n'}
})

output += "\n}"

fs.writeFileSync(outputPath, output);