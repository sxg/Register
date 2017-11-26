// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const dialog = require('electron').remote.dialog
const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer

const path = require('path')
const execFile = require('child_process').execFile

const imgPath = "/Users/Satyam/Dropbox/Research/Datasets/IBD/Bowel/images.mat"
const imgName = "images"
const anchorPath = "/Users/Satyam/Dropbox/Research/Datasets/IBD/Bowel/anchors.mat"
const anchorName = "anchor_vols"
const outputPath = "/Users/Satyam/Downloads"

let tempPath
let imageInput
let anchorInput
let outputInput

ipcRenderer.once('Message-TempPath', (event, message) => {
    tempPath = message
    console.log(tempPath)
})

const registerBtn = document.getElementById('button-register')
registerBtn.addEventListener('click', event => {
    pyRegister = execFile(path.join(__dirname, 'dist', 'register', 'register'),
        [tempPath, imgPath, imgName, anchorPath, anchorName, outputPath], 
            (err, stdout, stderr) => {
                console.log(err)
                console.log(stdout)
                console.log(stderr)
            })
})

// Browse images button
const imageBtn = document.getElementById('button-image-file')
imageBtn.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        imageInput = document.getElementById('input-image-file')
        imageInput.value = path.basename(filePaths[0])
    })
})

// Browse anchors button
const anchorBtn = document.getElementById('button-anchor-file')
anchorBtn.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        anchorInput = document.getElementById('input-anchor-file')
        anchorInput.value = path.basename(filePaths[0])
    })
})

// Browse output folder button
const outputBtn = document.getElementById('button-output-folder')
outputBtn.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}, 
        filePaths => {
            outputInput = document.getElementById('input-output-folder')
            outputInput.value = path.basename(filePaths[0])
        })
})
