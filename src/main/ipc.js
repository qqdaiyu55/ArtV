module.exports = {
  init,
  setModule
}

const electron = require('electron')

const app = electron.app

const log = require('./log')
const menu = require('./menu')
const windows = require('./windows')

// Will hold modules injected from the app that will be used on fired
// IPC events.
const modules = {}

function setModule(name, module) {
  modules[name] = module
}

function init() {
  const ipc = electron.ipcMain

  ipc.once('ipcReady', function (e) {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  /**
   * Dialog
   */
  ipc.on('openFolder', () => {
    const dialog = require('./dialog')
    dialog.openFolder()
  })

  /**
   * Dock
   */

  ipc.on('setBadge', (e, ...args) => {
    const dock = require('./dock')
    dock.setBadge(...args)
  })

  /**
   * Auto start on login
   */

  ipc.on('setStartup', (e, flag) => {
    const startup = require('./startup')

    if (flag) startup.install()
    else startup.uninstall()
  })

  /**
   * Windows: Main
   */

  const main = windows.main

  ipc.on('setAspectRatio', (e, ...args) => main.setAspectRatio(...args))
  ipc.on('setBounds', (e, ...args) => main.setBounds(...args))
  ipc.on('setProgress', (e, ...args) => main.setProgress(...args))
  ipc.on('setTitle', (e, ...args) => main.setTitle(...args))
  ipc.on('show', () => main.show())
  ipc.on('toggleFullScreen', (e, ...args) => main.toggleFullScreen(...args))
  ipc.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))
}
