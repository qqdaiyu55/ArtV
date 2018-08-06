# ArtV

## Architecture

```
src
├── config.js: config file
├── main
│   ├── dialog.js: dialog controller
│   ├── index.js
│   ├── ipc.js: ipcMain module listening on IPC events emitted from renderer
│   ├── log.js: send logs to main window where they can be viewed in Developer Tool
│   ├── menu.js: create menu
│   ├── tray.js
│   └── windows
│       ├── index.js
│       └── main.js: create main window
└── renderer
    ├── components
    │   ├── medialist.js
    │   ├── sidebar.js
    │   └── tree.js
    ├── lib
    │   ├── dispatcher.js
    │   └── state.js
    ├── main.js
    └── pages
        ├── add-artist.js
        ├── app.js
        ├── gallery.js
        └── preference.js
```

