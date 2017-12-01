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
                        htmlFile = process.platform === 'darwin' ? 'prefLinux.html' : 'pref.html'
                        height = process.platform === 'darwin' ? 511 : 425
                        prefWindow = new BrowserWindow({width: 350, height: height, titleBarStyle: 'hiddenInset', resizable: false})
                        prefWindow.loadURL(url.format({
                            pathname: path.join(__dirname, htmlFile),
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