console.time('init')

// Perf optimization: Start asynchronously read on config file before all the
// blocking require() calls below.

const State = require('./lib/state')
State.load(onState)

const electron = require('electron')
const React = require('react')
const ReactDOM = require('react-dom')
const fs = require('fs')

const config = require('../config')

const App = require('./pages/app')

// Electron apps have two processes: a main process (node) runs first and starts
// a renderer process (essentially a Chrome window). We're in the renderer process,
// and this IPC channel receives from and sends messages to the main process
const ipcRenderer = electron.ipcRenderer

// Yo-yo pattern: state object lives here and percolates down thru all the views.
// Events come back up from the views via dispatch(...)
require('./lib/dispatcher').setDispatch(dispatch)

// From dispatch(...), events are sent to one of the controllers
let controllers = null

// All state lives in state.js. `state.saved` is read from and written to a file.
// All other state is ephemeral. First we load state.saved then initialize the app.
let state

// Root React component
let app

// Called once when the application loads. (Not once per window.)
// Connects to the torrent networks, sets up the UI and OS integrations like
// the dock icon and drag+drop.
function onState(err, _state) {
  if (err) return onError(err)

  // Make available for easier debugging
  state = window.state = _state
  window.dispatch = dispatch

  // telemetry.init(state)

  // Log uncaught JS errors
  // window.addEventListener(
  //   'error', (e) => telemetry.logUncaughtError('window', e), true /* capture */
  // )

  // Create controllers
  controllers = {
    
  }

  // Initialize ReactDOM
  app = ReactDOM.render(<App state={state} />, document.querySelector('#body'))

  // Listen for messages from the main process
  setupIpc()

  // const debouncedFullscreenToggle = debounce(function () {
  //   dispatch('toggleFullScreen')
  // }, 1000, true)

  // document.addEventListener('wheel', function (event) {
  //   // ctrlKey detects pinch to zoom, http://crbug.com/289887
  //   if (event.ctrlKey) {
  //     event.preventDefault()
  //     debouncedFullscreenToggle()
  //   }
  // })

  // ...focus and blur. Needed to show correct dock icon text ('badge') in OSX
  // window.addEventListener('focus', onFocus)
  // window.addEventListener('blur', onBlur)

  // Done! Ideally we want to get here < 500ms after the user clicks the app
  console.timeEnd('init')
}

// Runs a few seconds after the app loads, to avoid slowing down startup time
function delayedInit() {

}

// React loop:
// 1. update() - recompute the virtual DOM, diff, apply to the real DOM
// 2. event - might be a click or other DOM event, or something external
// 3. dispatch - the event handler calls dispatch(), main.js sends it to a controller
// 4. controller - the controller handles the event, changing the state object
function update () {
  app.setState(state)
  updateElectron()
}

// Some state changes can't be reflected in the DOM, instead we have to
// tell the main process to update the window or OS integrations
function updateElectron () {

}

const dispatchHandlers = {
  'addSource': () => ipcRenderer.send('addSource'),

  'onOpen': onOpen
}

// Events from the UI never modify state directly. Instead they call dispatch()
function dispatch(action, ...args) {
  // Log dispatch calls, for debugging, but don't spam
  if (!['mediaMouseMoved', 'mediaTimeUpdate', 'update'].includes(action)) {
    console.log('dispatch: %s %o', action, args)
  }

  const handler = dispatchHandlers[action]
  if (handler) handler(...args)
  else console.error('Missing dispatch handler: ' + action)

  update()
}

// Listen to events from the main and webtorrent processes
function setupIpc() {
  ipcRenderer.on('log', (e, ...args) => console.log(...args))
  ipcRenderer.on('error', (e, ...args) => console.error(...args))

  ipcRenderer.on('dispatch', (e, ...args) => dispatch(...args))

  ipcRenderer.on('fullscreenChanged', onFullscreenChanged)
  ipcRenderer.on('windowBoundsChanged', onWindowBoundsChanged)

  ipcRenderer.send('ipcReady')

  State.on('stateSaved', () => ipcRenderer.send('stateSaved'))
}

// Quits any modal popovers and returns to the torrent list screen
function backToList() {
  // Exit any modals and screens with a back button
  state.modal = null
  state.location.backToFirst(function () {
    // If we were already on the torrent list, scroll to the top
    const contentTag = document.querySelector('.content')
    if (contentTag) contentTag.scrollTop = 0
  })
}

// Quits modals, full screen, or goes back. Happens when the user hits ESC
function escapeBack() {
  if (state.modal) {
    dispatch('exitModal')
  } else if (state.window.isFullScreen) {
    dispatch('toggleFullScreen')
  } else {
    dispatch('back')
  }
}

function onOpen(selectedPath) {
}

function onError(err) {
  console.error(err.stack || err)
  sound.play('ERROR')
  state.errors.push({
    time: new Date().getTime(),
    message: err.message || err
  })

  update()
}

const editableHtmlTags = new Set(['input', 'textarea'])

function onPaste(e) {
  
}

function onFocus(e) {
  state.window.isFocused = true
  state.dock.badge = 0
  update()
}

function onBlur() {
  state.window.isFocused = false
  update()
}

function onVisibilityChange() {
  state.window.isVisible = !document.webkitHidden
}

function onFullscreenChanged(e, isFullScreen) {
  state.window.isFullScreen = isFullScreen
  if (!isFullScreen) {
    // Aspect ratio gets reset in fullscreen mode, so restore it (Mac)
    ipcRenderer.send('setAspectRatio', state.playing.aspectRatio)
  }

  update()
}

function onWindowBoundsChanged(e, newBounds) {
  if (state.location.url() !== 'player') {
    state.saved.bounds = newBounds
    dispatch('stateSave')
  }
}

function checkDownloadPath() {
  fs.stat(state.saved.prefs.downloadPath, function (err, stat) {
    if (err) {
      state.downloadPathStatus = 'missing'
      return console.error(err)
    }
    if (stat.isDirectory()) state.downloadPathStatus = 'ok'
    else state.downloadPathStatus = 'missing'
  })
}