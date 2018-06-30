module.exports = {
  openFolder
}

const electron = require('electron')
const fs = require('fs')

const log = require('./log')
const windows = require('./windows')

/*
 * Show flexible open dialog that supports selecting .torrent files to add, or
 * a file or folder to create a single-file or single-directory torrent.
 */
function openFolder() {
  if (!windows.main.win) return
  log('open folder')
  const opts = {
    title: 'Select a folder to add.',
    properties: ['openDirectory']
  }
  electron.dialog.showOpenDialog(windows.main.win, opts, function (selectedPath) {
    if (!Array.isArray(selectedPath)) return
    windows.main.dispatch('onOpen', selectedPath)
  })
}

/**
 * Dialogs on do not show a title on Mac, so the window title is used instead.
 */
function setTitle(title) {
  if (process.platform === 'darwin') {
    windows.main.dispatch('setTitle', title)
  }
}

function resetTitle() {
  windows.main.dispatch('resetTitle')
}
