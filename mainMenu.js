// Electron dependencies
const electron = require('electron')
const {app, BrowserWindow} = electron

// Node dependencies
const url = require('url')
const path = require('path')

let prefWindow

module.exports = [
    {
        label: app.getName(),
        submenu: [{
            role: 'about'
        },
        {
            type: 'separator'
        },
        {
            label: 'Preferences...',
            accelerator: 'CmdOrCtrl+,',
            click: function(menuItem, browserWindow, event) {
                    if (!prefWindow) {
                        // Create the preferences window
                        prefWindow = new BrowserWindow({width: 350, height: 425, titleBarStyle: 'hiddenInset'})
                        prefWindow.loadURL(url.format({
                            pathname: path.join(__dirname, 'pref.html'),
                            protocol: 'file:',
                            slashes: true
                        }))

                        // Dereference the window when closed
                        prefWindow.on('closed', () => {
                            prefWindow = null
                        })
                    } else {
                        if (prefWindow.isMinimized()) {
                            prefWindow.restore()
                        }
                        prefWindow.focus()
                    }
                }
        },
        {
            type: 'separator'
        },
        {
            role: 'quit'
        }]
    },
    {
        label: 'File',
        submenu: [{
            role: 'close'
        }]
    },
    {
        label: 'View',
        submenu: [{
            role: 'toggledevtools'
        }]
    }
]