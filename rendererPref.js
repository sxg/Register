const {remote} = require('electron')
const {dialog} = remote

const settings = require('electron-settings')
const path = require('path')

//// View
// Window
const window = remote.getCurrentWindow()

// Inputs
const broccoliPathInput = document.getElementById('input-broccoli-path')
const platformInput = document.getElementById('input-platform')
const deviceInput = document.getElementById('input-device')

// Labels
const broccoliPathLabel = document.getElementById('label-broccoli-path')
const platformLabel = document.getElementById('label-platform')
const deviceLabel = document.getElementById('label-device')
const labels = [broccoliPathLabel, platformLabel, deviceLabel]

// Buttons
const broccoliPathButton = document.getElementById('button-broccoli-path')
const saveButton = document.getElementById('button-save')

//// Model
let broccoliPath
let rtvPath
let platform
let device

//// UI actions
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
                osString = process.platform === 'darwin' ? 'Mac' : 'Linux'
                rtvPath = path.join(broccoliPath, 'compiled', 'Bash', osString, 'Release', 'RegisterTwoVolumes')
                settings.set('BROCCOLIPath', broccoliPath)
                settings.set('RTVPath', rtvPath)
            } else {
                showError(broccoliPathLabel)
            }
        })
    }
)

// Save settings
saveButton.addEventListener('click', event => {
    hideErrors()
    if (!platformInput.value) {
        showError(platformLabel)
    } else if (!deviceInput.value) {
        showError(deviceLabel)
    } else {
        settings.set('OpenCLPlatform', parseInt(platformInput.value))
        settings.set('OpenCLDevice', parseInt(deviceInput.value))
        window.close()
    }
})

//// Helpers
const hideErrors = function() {
    labels.forEach(label => {
        label.style.display = 'none'
    })
}

const showError = function(label) {
    label.style.display = 'inline-block'
}

const loadPreferences = function() {
    broccoliPath = settings.get('BROCCOLIPath')
    rtvPath = settings.get('RTVPath')
    platform = settings.get('OpenCLPlatform')
    device = settings.get('OpenCLDevice')

    if (broccoliPath) {
        broccoliPathInput.value = broccoliPath
    }
    if (platform) {
        platformInput.value = platform.toString()
    }
    if (device) {
        deviceInput.value = device.toString()
    }
}