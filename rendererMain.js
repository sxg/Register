// Electron dependencies
const {remote, ipcRenderer} = require('electron')
const {dialog} = remote

// Node dependencies
const path = require('path')
const execFile = require('child_process').execFile
const settings = require('electron-settings')

//// View
// Window
const window = remote.getCurrentWindow()

// Inputs
const imageFileInput = document.getElementById('input-image-file')
const imageNameInput = document.getElementById('input-image-name')
const anchorFileInput = document.getElementById('input-anchor-file')
const anchorNameInput = document.getElementById('input-anchor-name')
const outputFolderInput = document.getElementById('input-output-folder')

// Labels
const imageFileLabel = document.getElementById('label-image-file')
const imageNameLabel = document.getElementById('label-image-name')
const anchorFileLabel = document.getElementById('label-anchor-file')
const anchorNameLabel = document.getElementById('label-anchor-name')
const outputFolderLabel = document.getElementById('label-output-folder')

// Messages
const errorMessage = document.getElementById('message-error')
const headerErrorMessage = document.getElementById('message-error-header')

// Buttons
const imageButton = document.getElementById('button-image-file')
const anchorButton = document.getElementById('button-anchor-file')
const outputButton = document.getElementById('button-output-folder')
const registerButton = document.getElementById('button-register')

// Loaders
const registeringImagesLoader = document.getElementById('loader-registering-images') 

//// Model
let tempPath
let imagePath, imageName
let anchorPath, anchorName
let outputPath
let broccoliPath, rtvPath, platform, device

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
        if (filePaths && filePaths[0]) {
            imageFileInput.value = path.basename(filePaths[0])
            imagePath = filePaths[0]
        } else {
            showErrorLabel(imageFileLabel)
        }
    })
})

imageNameInput.addEventListener('change', event => {
    imageName = imageNameInput.value
})

// Browse anchors button
anchorButton.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
        properties: ['openFile']
    }, filePaths => {
        if (filePaths && filePaths[0]) {
            anchorFileInput.value = path.basename(filePaths[0])
            anchorPath = filePaths[0]
        } else {
            showErrorLabel(anchorFileLabel)
        }
    })
})

anchorNameInput.addEventListener('change', event => {
    anchorName = anchorNameInput.value
})

// Browse output folder button
outputButton.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']}, 
        filePaths => {
            if (filePaths && filePaths[0]) {
                outputFolderInput.value = path.basename(filePaths[0])
                outputPath = filePaths[0]
            } else {
                showErrorLabel(outputFolderLabel)
            }
        })
})

// Register button
registerButton.addEventListener('click', event => {
    hideErrors()
    startLoader()

    const err = loadPreferences()
    if (!err) {
        pyRegister = execFile(path.join(__dirname, 'dist', 'register', 'register'),
            [tempPath, broccoliPath, rtvPath, platform, device, imagePath, imageName, anchorPath, anchorName, outputPath], 
                (err, stdout, stderr) => {
                    stopLoader()

                    if (stderr) {
                        console.log(new Error(stderr))
                        
                        switch (stderr.trim()) {
                            case 'RTVPath':
                            case 'BROCCOLIPath':
                                showErrorMessage('Update settings!')
                                break
                            case 'ImagePath':
                                showErrorLabel(imageFileLabel)
                                break
                            case 'ImageName':
                                showErrorLabel(imageNameLabel)
                                break
                            case 'AnchorPath':
                                showErrorLabel(anchorFileLabel)
                                break
                            case 'AnchorName':
                                showErrorLabel(anchorNameLabel)
                                break
                            case 'OutputPath':
                                showErrorLabel(outputFolderLabel)
                                break
                        }
                    }
                    if (stdout) {
                        console.log(stdout)
                    }
                })
    } else {
        stopLoader()
        showErrorMessage(err)
    }
})

//// Helpers

const loadPreferences = function() {
    if (settings.has('BROCCOLIPath')) {
        broccoliPath = settings.get('BROCCOLIPath')
    } else {
        return 'Set the BROCCOLI path in settings!'
    }
    if (settings.has('RTVPath')) {
        rtvPath = settings.get('RTVPath')
    } else {
        return 'Set the BROCCOLI path in settings!'
    }
    if (settings.has('OpenCLPlatform')) {
        platform = settings.get('OpenCLPlatform')
    } else {
        return 'Set the platform in settings!'
    }
    if (settings.has('OpenCLDevice')) {
        device = settings.get('OpenCLDevice')
    } else {
        return 'Set the device in settings!'
    }
}

const hideErrors = function() {
    imageFileLabel.style.display = 'none'
    imageNameLabel.style.display = 'none'
    anchorFileLabel.style.display = 'none'
    anchorNameLabel.style.display = 'none'
    outputFolderLabel.style.display = 'none'
    headerErrorMessage.innerHTML = ''
    errorMessage.style.display = 'none'
    const size = window.getSize()
    window.setSize(size[0], 375, true)
}

const showErrorMessage = function(message) {
    headerErrorMessage.innerHTML = message
    errorMessage.style.display = 'inline-block' 
    const size = window.getSize()
    window.setSize(size[0], Math.max(size[1], 475), true) 
}

const showErrorLabel = function(label) {
    label.style.display = 'inline-block'
}

const startLoader = function() {
    registeringImagesLoader.classList.remove('disabled')
    registeringImagesLoader.classList.add('active')
}

const stopLoader = function() {
    registeringImagesLoader.classList.remove('active')
    registeringImagesLoader.classList.add('disabled')
}