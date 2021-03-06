const {remote} = require('electron')
const {dialog} = remote

const settings = require('electron-settings')
const path = require('path')

/// View
// Window
const window = remote.getCurrentWindow()

// Inputs
const broccoliPathInput = document.getElementById('input-broccoli-path')
const openclPathInput = document.getElementById('input-opencl-path')
const platformInput = document.getElementById('input-platform')
const deviceInput = document.getElementById('input-device')

// Input containers
const broccoliPathInputContainer = document.getElementById('input-broccoli-path-container')
const openclPathInputContainer = document.getElementById('input-opencl-path-container')
const platformInputContainer = document.getElementById('input-platform-container')
const deviceInputContainer = document.getElementById('input-device-container')
const inputContainers = [broccoliPathInputContainer, platformInputContainer, deviceInputContainer]
if (openclPathInputContainer) {
  inputContainers.shift(openclPathInputContainer)
}

// Buttons
const broccoliPathButton = document.getElementById('button-broccoli-path')
const openclPathButton = document.getElementById('button-opencl-path')
const saveButton = document.getElementById('button-save')

/// Model
let broccoliPath
let openclPath
let rtvPath
let platform
let device

/// UI actions
// Load preferences
window.webContents.on('did-finish-load', () => {
  loadPreferences()
})

// Browse BROCCOLI path
broccoliPathButton.addEventListener('click', event => {
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
    filePaths => {
      if (filePaths && filePaths[0]) {
        hideErrors()
        broccoliPath = filePaths[0]
        broccoliPathInput.value = broccoliPath
        const osString = process.platform === 'darwin' ? 'Mac' : 'Linux'
        rtvPath = path.join(broccoliPath, 'compiled', 'Bash', osString, 'Release', 'RegisterTwoVolumes')
        settings.set('BROCCOLIPath', broccoliPath)
        settings.set('RTVPath', rtvPath)
      } else {
        showError(broccoliPathInputContainer)
      }
    })
}
)

// Browse OpenCL path
if (openclPathButton) {
  openclPathButton.addEventListener('click', event => {
    dialog.showOpenDialog(window, {properties: ['openDirectory']},
      filePaths => {
        if (filePaths && filePaths[0]) {
          hideErrors()
          openclPath = filePaths[0]
          openclPathInput.value = openclPath
          settings.set('OpenCLPath', openclPath)
        } else {
          showError(openclPathInputContainer)
        }
      })
  }
  )
}

// Save settings
saveButton.addEventListener('click', event => {
  hideErrors()
  if (!platformInput.value) {
    showError(platformInputContainer)
  } else if (!deviceInput.value) {
    showError(deviceInputContainer)
  } else {
    settings.set('OpenCLPlatform', parseInt(platformInput.value))
    settings.set('OpenCLDevice', parseInt(deviceInput.value))
    window.close()
  }
})

/// Helpers
const hideErrors = function () {
  inputContainers.forEach(inputContainer => {
    inputContainer.classList.remove('error')
  })
}

const showError = function (inputContainer) {
  inputContainer.classList.add('error')
}

const loadPreferences = function () {
  broccoliPath = settings.get('BROCCOLIPath')
  rtvPath = settings.get('RTVPath')
  openclPath = settings.get('OpenCLPath')
  platform = settings.get('OpenCLPlatform')
  device = settings.get('OpenCLDevice')

  if (broccoliPath) {
    broccoliPathInput.value = broccoliPath
  }
  if (openclPath && openclPathInput) {
    openclPathInput.value = openclPath
  }
  if (platform) {
    platformInput.value = platform.toString()
  }
  if (device) {
    deviceInput.value = device.toString()
  }
}
