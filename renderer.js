// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const dialog = require('electron').remote.dialog
const ipcRenderer = require('electron').ipcRenderer

const path = require('path')
const execFile = require('child_process').execFile

const imgPath = "/Users/Satyam/Dropbox/Research/Datasets/IBD/Bowel/images.mat"
const imgName = "images"
const anchorPath = "/Users/Satyam/Dropbox/Research/Datasets/IBD/Bowel/anchors.mat"
const anchorName = "anchor_vols"
const outputPath = "/Users/Satyam/Downloads"

ipcRenderer.once('temp-path-message', (event, tempPath) => {
    console.log(tempPath)
    pyRegister = execFile(path.join(__dirname, 'dist', 'register', 'register'),
        [tempPath, imgPath, imgName, anchorPath, anchorName, outputPath], 
            (err, stdout, stderr) => {
                console.log(err)
                console.log(stdout)
                console.log(stderr)
            })
})

const reconImagesBtn = document.getElementById('button-images-file')
reconImagesBtn.addEventListener('click', function (event) {
    dialog.showOpenDialog({properties: ['openFile']},
    function(filePaths) {
        const reconImagesInput = document.getElementById('input-images-file')
        reconImagesInput.value = path.basename(filePaths[0])
    })
})