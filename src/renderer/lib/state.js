const appConfig = require('application-config')('ArtV')
const path = require('path')
const { EventEmitter } = require('events')

const config = require('../../config')

const SAVE_DEBOUNCE_INTERVAL = 1000

appConfig.filePath = path.join(config.CONFIG_PATH, 'config.json')

const State = module.exports = Object.assign(new EventEmitter(), {
  load,
  // state.save() calls are rate-limited. Use state.saveImmediate() to skip limit.
  save: function () {
    // Perf optimization: Lazy-require debounce (and it's dependencies)
    const debounce = require('debounce')
    // After first State.save() invokation, future calls go straight to the
    // debounced function
    State.save = debounce(saveImmediate, SAVE_DEBOUNCE_INTERVAL)
    State.save(...arguments)
  },
  saveImmediate
})

function getDefaultState() {
  // const LocationHistory = require('location-history')

  return {
    /*
     * Temporary state disappears once the program exits.
     * It can contain complex objects like open connections, etc.
     */
    prev: { /* used for state diffing in updateElectron() */
      title: null,
      progress: -1,
      badge: null
    },
    // location: new LocationHistory(),
    window: {
      bounds: null, /* {x, y, width, height } */
      isFocused: true,
      isFullScreen: false,
      title: config.APP_WINDOW_TITLE
    },
    dock: {
      badge: 0,
      progress: 0
    },
    modal: null, /* modal popover */
    errors: [], /* user-facing errors */

    /*
     * Saved state is read from and written to a file every time the app runs.
     * It should be simple and minimal and must be JSON.
     * It must never contain absolute paths since we have a portable app.
     *
     * Config path:
     *
     * Mac                  ~/Library/Application Support/ArtV/config.json
     * Linux (XDG)          $XDG_CONFIG_HOME/ArtV/config.json
     * Linux (Legacy)       ~/.config/ArtV/config.json
     * Windows (> Vista)    %LOCALAPPDATA%/ArtV/config.json
     * Windows (XP, 2000)   %USERPROFILE%/Local Settings/Application Data/ArtV/config.json
     *
     * Also accessible via `require('application-config')('ArtV').filePath`
     */
    saved: {}
  }
}

/* If the saved state file doesn't exist yet, here's what we use instead */
function setupStateSaved(cb) {
  const saved = {
    prefs: {
      downloadPath: config.DEFAULT_DOWNLOAD_PATH,
      startup: false
    },
    version: config.APP_VERSION, /* make sure we can upgrade gracefully later */
    artistTree: [
      {
        title: 'Favorite',
        key: 'favorite',
        type: 'favorite',
        isLeaf: true
      }
    ]
  }
  
  cb(null, saved)
}

function load(cb) {
  appConfig.read(function (err, saved) {
    if (err || !saved.version) {
      console.log('Missing config file: Creating new one')
      setupStateSaved(onSavedState)
    } else {
      onSavedState(null, saved)
    }
  })

  function onSavedState(err, saved) {
    if (err) return cb(err)
    const state = getDefaultState()
    state.saved = saved

    // if (process.type === 'renderer') {
    //   // Perf optimization: Save require() calls in the main process
    //   const migrations = require('./migrations')
    //   migrations.run(state)
    // }

    cb(null, state)
  }
}

// Write state.saved to the JSON state file
function saveImmediate(state, cb) {
  console.log('Saving state to ' + appConfig.filePath)

  // Clean up, so that we're not saving any pending state
  const copy = Object.assign({}, state.saved)

  appConfig.write(copy, (err) => {
    if (err) console.error(err)
    else State.emit('stateSaved')
  })
}
