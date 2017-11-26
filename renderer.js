// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const dialog = require('electron').remote.dialog
const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer

const path = require('path')
const execFile = require('child_process').execFile

let tempPath
const imageFileInput = document.getElementById('input-image-file')
const imageNameInput = document.getElementById('input-image-name')
const anchorFileInput = document.getElementById('input-anchor-file')
const anchorNameInput = document.getElementById('input-anchor-name')
const outputFolderInput = document.getElementById('input-output-folder')

let imagePath
let anchorPath
let outputPath

ipcRenderer.once('Message-TempPath', (event, message) => {
    tempPath = message
    console.log(tempPath)
})

// Browse images button
const imageBtn = document.getElementById('button-image-file')
imageBtn.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        imageFileInput.value = path.basename(filePaths[0])
        imagePath = filePaths[0]
    })
})

// Browse anchors button
const anchorBtn = document.getElementById('button-anchor-file')
anchorBtn.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        anchorFileInput.value = path.basename(filePaths[0])
        anchorPath = filePaths[0]
    })
})

// Browse output folder button
const outputBtn = document.getElementById('button-output-folder')
outputBtn.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}, 
        filePaths => {
            outputFolderInput.value = path.basename(filePaths[0])
            outputPath = filePaths[0]
        })
})

//  Register button
const registerBtn = document.getElementById('button-register')
registerBtn.addEventListener('click', event => {
    imageName = imageNameInput.value
    anchorName = anchorNameInput.value
    pyRegister = execFile(path.join(__dirname, 'dist', 'register', 'register'),
        [tempPath, imagePath, imageName, anchorPath, anchorName, outputPath], 
            (err, stdout, stderr) => {
                console.log(err)
                console.log(stdout)
                console.log(stderr)
            })
})
