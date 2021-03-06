// Electron dependencies
const electron = require('electron')
const {app, BrowserWindow, Menu} = electron

// Node dependencies
const settings = require('electron-settings')
const path = require('path')
const url = require('url')
const fs = require('fs')
const menuTemplate = require('./mainMenu')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tempPath
let broccoliPath

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 375, resizable: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    fs.readdirSync(tempPath).forEach(function (file) {
      const filePath = path.join(tempPath, file)
      fs.unlinkSync(filePath)
    })
    fs.rmdirSync(tempPath)

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Send the template and BROCCOLI paths to the renderer
  mainWindow.webContents.on('did-finish-load', () => {
    tempPath = path.join(app.getPath('temp'), 'Register')
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath)
    }
    mainWindow.webContents.send('Message-TempPath', tempPath)
    if (settings.has('BROCCOLIPath')) {
      broccoliPath = settings.get('BROCCOLIPath')
      mainWindow.webContents.send('Message-BROCCOLIPath', broccoliPath)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.makeSingleInstance(function (argv, workingDirectory) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
