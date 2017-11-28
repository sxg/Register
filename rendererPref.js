const {remote} = require('electron')
const {dialog} = remote

const settings = require('electron-settings')
const path = require('path')

//// UI components
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

//// UI actions
// Browse BROCCOLI path
broccoliPathButton.addEventListener('click', event => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openDirectory']},
        filePaths => {
            if (filePaths && filePaths[0]) {
                hideErrors()
                broccoliPathInput.value = filePaths[0]
                osString = process.platform === 'darwin' ? 'Mac' : 'Linux'
                rtvPath = path.join(filePaths[0], 'compiled', 'Bash', osString, 'Release', 'RegisterTwoVolumes')
                settings.set('BROCCOLIPath', filePaths[0])
            } else {
                showError(broccoliPathLabel)
            }
        })
})

// Helpers
const hideErrors = function() {
    labels.forEach(label => {
        label.style.display = 'none'
    })
}

const showError = function(label) {
    label.style.display = 'inline-block'
}
