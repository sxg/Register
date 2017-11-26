// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const dialog = require('electron').remote.dialog
const ipcRenderer = require('electron').ipcRenderer

const path = require('path')
const spawn = require('child_process').spawn

ipcRenderer.once('temp-path-message', (event, tempPath) => {
    console.log(tempPath)
    // pyRegister = spawn('python3', [path.join(__dirname, 'register.py'), tempPath])
    // pyRegister.stdout.on('data', data => {
    //     console.log(`stdout: ${data}`)
    // })
    // pyRegister.stderr.on('data', data => {
    //     console.log(`stderr: ${data}`)
    // })
})

const reconImagesBtn = document.getElementById('button-images-file')
reconImagesBtn.addEventListener('click', function (event) {
    dialog.showOpenDialog({properties: ['openFile']},
    function(filePaths) {
        const reconImagesInput = document.getElementById('input-images-file')
        reconImagesInput.value = path.basename(filePaths[0])
    })
})