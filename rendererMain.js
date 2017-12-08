// Electron dependencies
const {remote, ipcRenderer} = require('electron')
const {dialog} = remote

// Node dependencies
const path = require('path')
const execFile = require('child_process').execFile
const settings = require('electron-settings')

/// View
// Window
const window = remote.getCurrentWindow()

// Inputs
const imageFileInput = document.getElementById('input-image-file')
const imageNameInput = document.getElementById('input-image-name')
const anchorFileInput = document.getElementById('input-anchor-file')
const anchorNameInput = document.getElementById('input-anchor-name')
const outputFolderInput = document.getElementById('input-output-folder')

// Input containers
const imageFileInputContainer = document.getElementById('input-image-file-container')
const imageNameInputContainer = document.getElementById('input-image-name-container')
const anchorFileInputContainer = document.getElementById('input-anchor-file-container')
const anchorNameInputContainer = document.getElementById('input-anchor-name-container')
const outputFolderInputContainer = document.getElementById('input-output-folder-container')

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

/// Model
let tempPath
let imagePath, imageName
let anchorPath, anchorName
let outputPath
let broccoliPath, rtvPath, platform, device
let openclPath

ipcRenderer.once('Message-TempPath', (event, message) => {
  tempPath = message
})

/// UI actions
// Browse images button
imageButton.addEventListener('click', event => {
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    filters: [{name: 'Image Dataset', extensions: ['mat', 'h5']}],
    properties: ['openFile']
  }, filePaths => {
    hideErrors()
    if (filePaths && filePaths[0]) {
      imageFileInput.value = path.basename(filePaths[0])
      imagePath = filePaths[0]
    } else if (!imagePath) {
      showErrorInputContainer(imageFileInputContainer)
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
    hideErrors()
    if (filePaths && filePaths[0]) {
      anchorFileInput.value = path.basename(filePaths[0])
      anchorPath = filePaths[0]
    } else if (!anchorPath) {
      showErrorInputContainer(anchorFileInputContainer)
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
      hideErrors()
      if (filePaths && filePaths[0]) {
        outputFolderInput.value = filePaths[0]
        outputPath = filePaths[0]
      } else if (!outputPath) {
        showErrorInputContainer(outputFolderInputContainer)
      }
    })
})

// Register button
registerButton.addEventListener('click', event => {
  hideErrors()
  startLoader()

  const err = loadPreferences()
  if (!err) {
    execFile(path.join(__dirname, 'dist', 'register', 'register'),
      [tempPath, broccoliPath, rtvPath, platform, device, imagePath, imageName, anchorPath, anchorName, outputPath, openclPath],
      (err, stdout, stderr) => {
        stopLoader()

        if (stderr) {
          console.log(new Error(stderr))

          switch (stderr.trim()) {
            case 'RTVPath':
            case 'BROCCOLIPath':
            case 'OpenCLPath':
              showErrorMessage('Update settings!')
              break
            case 'ImagePath':
              showErrorInputContainer(imageFileInputContainer)
              break
            case 'ImageName':
              showErrorInputContainer(imageNameInputContainer)
              break
            case 'AnchorPath':
              showErrorInputContainer(anchorFileInputContainer)
              break
            case 'AnchorName':
              showErrorInputContainer(anchorNameInputContainer)
              break
            case 'OutputPath':
              showErrorInputContainer(outputFolderInputContainer)
              break
          }
        }

        if (err) {
          console.log(new Error(err))
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

/// Helpers

const loadPreferences = function () {
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
  if (settings.has('OpenCLPath')) {
    openclPath = settings.get('OpenCLPath')
  } else if (process.platform === 'linux') {
    return 'Set the OpenCL Path in settings!'
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

const hideErrors = function () {
  imageFileInputContainer.classList.remove('error')
  imageNameInputContainer.classList.remove('error')
  anchorFileInputContainer.classList.remove('error')
  anchorNameInputContainer.classList.remove('error')
  outputFolderInputContainer.classList.remove('error')
  headerErrorMessage.innerHTML = ''
  errorMessage.style.display = 'none'
  const size = window.getSize()
  window.setSize(size[0], 375, true)
}

const showErrorMessage = function (message) {
  headerErrorMessage.innerHTML = message
  errorMessage.style.display = 'inline-block'
  const size = window.getSize()
  window.setSize(size[0], Math.max(size[1], 475), true)
}

const showErrorInputContainer = function (inputContainer) {
  inputContainer.classList.add('error')
}

const startLoader = function () {
  registeringImagesLoader.classList.remove('disabled')
  registeringImagesLoader.classList.add('active')
}

const stopLoader = function () {
  registeringImagesLoader.classList.remove('active')
  registeringImagesLoader.classList.add('disabled')
}
