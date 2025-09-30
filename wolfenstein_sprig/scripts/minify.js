
import { minify_sync } from "terser"
import fs from "fs"
import path from "path"

const srcDir = "wolfenstein_sprig/vendor"
const srcDirGlobals = "wolfenstein_sprig/vendor/globals.js"
const gameCodePath = "buildWolf.js"
const gameDataPath = "buildWolfData.js"

const DEBUG = true

// globals should be ordered first
const fileOrder = [
    "globals.js",
    "files.js", 
    "map.js",
    "engine.js",
    "game.js",
    "interface.js"
]


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

function extractGameData(dir) {
    var results = {}
    fs.readdirSync(dir).forEach( entry => {
        const fullPath = path.join(dir, entry)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory() && entry === "data") {
            // Extract all files from the data directory
            Object.assign(results, extractGameData(fullPath));
        } else if (stat.isDirectory()) {
            // Skip non-data directories
            return
        } else if (stat.isFile() && entry.endsWith(".js") && fullPath.includes("/data/")) {
            const code = fs.readFileSync(fullPath, "utf8")
            results[fullPath] = code 
        }
    })
    return results
}

function extractGameCode(dir) {
    var results = {}
    fs.readdirSync(dir).forEach( entry => {
        const fullPath = path.join(dir, entry)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory() && entry === "data") {
            // Skip data directory
            return
        } else if (stat.isDirectory()) {
            Object.assign(results, extractGameCode(fullPath));
        } else if (stat.isFile() && entry.endsWith(".js") && !fullPath.includes("/data/")) {
            const code = fs.readFileSync(fullPath, "utf8")
            results[fullPath] = code 
        }
    })
    return results
}

function reorderFiles(codeObj, order) {
    const ordered = {}
    
    order.forEach(filename => {
        const fullPath = Object.keys(codeObj).find(path => path.endsWith(filename))
        if (fullPath) {
            ordered[fullPath] = codeObj[fullPath]
        }
    })
    
    Object.keys(codeObj).forEach(filePath => {
        if (!ordered[filePath]) {
            ordered[filePath] = codeObj[filePath]
        }
    })
    
    return ordered
}


var gameCode = extractGameCode(srcDir)
var gameData = extractGameData(srcDir)

gameCode = reorderFiles(gameCode, fileOrder)

const options = { 
    mangle: false,
    parse: {
        ecma: 2020
    },
    compress: {
        ecma: 2020
    },
    format: {
        ecma: 2020
    }
}

try {
    let gameCodeOutput
    if (DEBUG) {
        gameCodeOutput = gameCode[srcDirGlobals]
        delete gameCode[srcDirGlobals]
        gameCodeOutput += Object.values(gameCode).join("\n")
    } else {
        console.log(`Minifying game code files: ${Object.keys(gameCode).join(', ')}`)
        var codeResult = minify_sync(gameCode, options)
        gameCodeOutput = `${codeResult.code}`
    }

    fs.writeFileSync(gameCodePath, gameCodeOutput, 'utf8')
    console.log(`Built minified game code to ${gameCodePath}`)
    console.log(`Game code size: ${(fs.statSync(gameCodePath).size / 1024).toFixed(2)} KB`)

    // Build game data (if any exists)
    if (Object.keys(gameData).length > 0) {
        console.log(`Minifying game data files: ${Object.keys(gameData).join(', ')}`)
        var dataResult = minify_sync(gameData, options)
        const gameDataOutput = `${dataResult.code}`

        fs.writeFileSync(gameDataPath, gameDataOutput, 'utf8')
        console.log(`Built minified game data to ${gameDataPath}`)
        console.log(`Game data size: ${(fs.statSync(gameDataPath).size / 1024).toFixed(2)} KB`)
    } else {
        console.log(`No game data files found - skipping ${gameDataPath}`)
    }

    console.log(`\nBuild complete!`)
    console.log(`- Game code: ${gameCodePath}`)
    if (Object.keys(gameData).length > 0) {
        console.log(`- Game data: ${gameDataPath}`)
    }

} catch (err) {
    console.log(`Failed to build: ${err.message}`)
    process.exit(1)
}
