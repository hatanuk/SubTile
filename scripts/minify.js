// This script minifies code in /src into a single JS line 
// Which is saved at sprigShip.js to be directly copy-pasted into your Sprig file

import { minify_sync } from "terser"
import fs from "fs"
import path from "path"
import banner from "./buildBanner.js"

const srcDir = "src"
const buildPath = "build.js"

path.join()


function extractRawCode(dir) {

    var results = {}

    fs.readdirSync(dir).forEach( entry => {
        const fullPath = path.join(dir, entry)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            Object.assign(results, extractRawCode(fullPath));
        } else if (stat.isFile() && entry.endsWith(".js")) {
            const code = fs.readFileSync(fullPath, "utf8")
            results[fullPath] = code 
        }

    })

    return results

}


var src = extractRawCode(srcDir)

const options = { 
    mangle: false
}

try {
    var result = minify_sync(src, options)
    fs.writeFileSync(buildPath, banner + "\n \n" + result.code);
    console.log(`Built minified code to ${buildPath}`)
} catch (err) {
    console.log(`Failed to build: ${err.message}`)
    process.exit(1)
}
