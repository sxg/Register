// Electron dependencies
const dialog = require('electron').remote.dialog
const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer

// Node dependencies
const path = require('path')
const execFile = require('child_process').execFile
const settings = require('electron-settings')

//// View
// Inputs
const imageFileInput = document.getElementById('input-image-file')
const imageNameInput = document.getElementById('input-image-name')
const anchorFileInput = document.getElementById('input-anchor-file')
const anchorNameInput = document.getElementById('input-anchor-name')
const outputFolderInput = document.getElementById('input-output-folder')
const broccoliFolderInput = document.getElementById('input-broccoli-folder')

// Labels
const imageFileLabel = document.getElementById('label-image-file')
const imageNameLabel = document.getElementById('label-image-name')
const anchorFileLabel = document.getElementById('label-anchor-file')
const anchorNameLabel = document.getElementById('label-anchor-name')
const outputFolderLabel = document.getElementById('label-output-folder')
const broccoliFolderLabel = document.getElementById('label-broccoli-folder')

// Buttons
const imageButton = document.getElementById('button-image-file')
const anchorButton = document.getElementById('button-anchor-file')
const outputButton = document.getElementById('button-output-folder')
const registerButton = document.getElementById('button-register')

// Loaders
const registeringImagesLoader = document.getElementById('loader-registering-images') 

//// Model
let tempPath
let imagePath
let anchorPath
let outputPath
let broccoliPath
let rtvPath
let platform
let device

ipcRenderer.once('Message-TempPath', (event, message) => {
    tempPath = message
})

//// UI actions
// Browse images button
imageButton.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        imageFileInput.value = path.basename(filePaths[0])
        imagePath = filePaths[0]
    })
})

// Browse anchors button
anchorButton.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        anchorFileInput.value = path.basename(filePaths[0])
        anchorPath = filePaths[0]
    })
})

// Browse output folder button
outputButton.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}, 
        filePaths => {
            outputFolderInput.value = path.basename(filePaths[0])
            outputPath = filePaths[0]
        })
})

// Register button
registerButton.addEventListener('click', event => {
    imageFileLabel.style.display = 'none'
    imageNameLabel.style.display = 'none'
    anchorFileLabel.style.display = 'none'
    anchorNameLabel.style.display = 'none'
    outputFolderLabel.style.display = 'none'
    broccoliFolderLabel.style.display = 'none'
    
    imageName = imageNameInput.value
    anchorName = anchorNameInput.value

    registeringImagesLoader.classList.remove('disabled')
    registeringImagesLoader.classList.add('active')

    pyRegister = execFile(path.join(__dirname, 'dist', 'register', 'register'),
        [tempPath, broccoliPath, rtvPath, imagePath, imageName, anchorPath, anchorName, outputPath], 
            (err, stdout, stderr) => {
                registeringImagesLoader.classList.remove('active')
                registeringImagesLoader.classList.add('disabled')

                if (stderr) {
                    console.log(new Error(stderr))
                    
                    switch (stderr.trim()) {
                        case 'RTVPath':
                        case 'BROCCOLIPath':
                            broccoliFolderLabel.style.display = 'inline-block'
                            break
                        case 'ImagePath':
                            imageFileLabel.style.display = 'inline-block' 
                            break
                        case 'ImageName':
                            imageNameLabel.style.display = 'inline-block'
                            break
                        case 'AnchorPath':
                            anchorFileLabel.style.display = 'inline-block'
                            break
                        case 'AnchorName':
                            anchorNameLabel.style.display = 'inline-block'
                            break
                        case 'OutputPath':
                            outputFolderLabel.style.display = 'inline-block'
                            break
                    }
                }
                if (stdout) {
                    console.log(stdout)
                }
            })
})
