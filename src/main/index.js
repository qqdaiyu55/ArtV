console.time('init')

const electron = require('electron')
const app = electron.app

const parallel = require('run-parallel')

const config = require('../config')
const ipc = require('./ipc')
const log = require('./log')
const menu = require('./menu')
const State = require('../renderer/lib/state')
const windows = require('./windows')

let shouldQuit = false
let argv = sliceArgv(process.argv)

// Start the app without showing the main window when auto launching on login
// (On Windows and Linux, we get a flag. On MacOS, we get special API.)
const hidden = argv.includes('--hidden') ||
  (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden)

if (config.IS_PRODUCTION) {
  // When Electron is running in production mode (packaged app), then run React
  // in production mode too.
  process.env.NODE_ENV = 'production'
}

if (process.platform === 'win32') {
  const squirrelWin32 = require('./squirrel-win32')
  shouldQuit = squirrelWin32.handleEvent(argv[0])
  argv = argv.filter((arg) => !arg.includes('--squirrel'))
}

if (!shouldQuit && !config.IS_PORTABLE) {
  // Prevent multiple instances of app from running at same time. New instances
  // signal this instance and quit. Note: This feature creates a lock file in
  // %APPDATA%\Roaming\ArtV so we do not do it for the Portable App since
  // we want to be "silent" as well as "portable".
  shouldQuit = app.makeSingleInstance(onAppOpen)
  if (shouldQuit) {
    app.quit()
  }
}

if (!shouldQuit) {
  init()
}

function init() {
  if (config.IS_PORTABLE) {
    const path = require('path')
    // Put all user data into the "Portable Settings" folder
    app.setPath('userData', config.CONFIG_PATH)
    // Put Electron crash files, etc. into the "Portable Settings\Temp" folder
    app.setPath('temp', path.join(config.CONFIG_PATH, 'Temp'))
  }

  const ipcMain = electron.ipcMain

  let isReady = false // app ready, windows can be created
  app.ipcReady = false // main window has finished loading and IPC is ready
  app.isQuitting = false

  parallel({
    appReady: (cb) => app.on('ready', () => cb(null)),
    state: (cb) => State.load(cb)
  }, onReady)

  function onReady(err, results) {
    if (err) throw err

    isReady = true
    const state = results.state

    windows.main.init(state, { hidden: hidden })
    menu.init()

    // To keep app startup fast, some code is delayed.
    // setTimeout(() => {
    //   delayedInit(state)
    // }, config.DELAYED_INIT)

    // Report uncaught exceptions
    // process.on('uncaughtException', (err) => {
    //   console.error(err)
    //   const error = { message: err.message, stack: err.stack }
    //   windows.main.dispatch('uncaughtError', 'main', error)
    // })
  }

  ipc.init()

  app.once('ipcReady', function () {
    log('Command line args:', argv)
    processArgv(argv)
    console.timeEnd('init')
  })

  app.on('before-quit', function (e) {
    if (app.isQuitting) return

    app.isQuitting = true
    e.preventDefault()
    windows.main.dispatch('stateSaveImmediate') // try to save state on exit
    ipcMain.once('stateSaved', () => app.quit())
    setTimeout(() => {
      console.error('Saving state took too long. Quitting.')
      app.quit()
    }, 4000) // quit after 4 secs, at most
  })

  app.on('activate', function () {
    if (isReady) windows.main.show()
  })
}

function delayedInit(state) {
  if (app.isQuitting) return
}

function onAppOpen(newArgv) {
  newArgv = sliceArgv(newArgv)

  if (app.ipcReady) {
    log('Second app instance opened, but was prevented:', newArgv)
    windows.main.show()

    processArgv(newArgv)
  } else {
    argv.push(...newArgv)
  }
}

// Remove leading args.
// Production: 1 arg, eg: /Applications/ArtV.app/Contents/MacOS/ArtV
// Development: 2 args, eg: electron .
// Test: 4 args, eg: electron -r .../mocks.js .
function sliceArgv(argv) {
  return argv.slice(config.IS_PRODUCTION ? 1
    : config.IS_TEST ? 4
      : 2)
}

function processArgv(argv) {
  
}