const React = require('react')
const Resizable = require('re-resizable')

const SideBar = require('../components/sidebar')
const Gallery = require('./gallery')
const AddArtist = require('./add-artist')

const config = require('../../config')

// const Views = {
//   'home': createGetter(() => TorrentListPage),
//   'preferences': createGetter(() => require('./preferences-page'))
// }

const fontFamily = process.platform === 'win32'
  ? '"Segoe UI", sans-serif'
  : 'BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif'

class App extends React.Component {
  render() {
    const state = this.props.state

    const sidebarWidth = state.saved.sidebarWidth
                          ? state.saved.sidebarWidth
                          : config.SIDEBAR_INITIAL_WIDTH

    // const cls = [
    //   'view-' + state.location.url(), /* e.g. view-home, view-player */
    //   'is-' + process.platform /* e.g. is-darwin, is-win32, is-linux */
    // ]
    // if (state.window.isFullScreen) cls.push('is-fullscreen')
    // if (state.window.isFocused) cls.push('is-focused')

    return (
      // <div className={'app ' + cls.join(' ')}>
      <div className='app'>
        {/* {this.getErrorPopover()} */}
        {/* <div key='content' className='content'>{this.getView()}</div> */}
        <Resizable
          defaultSize={{width: sidebarWidth, height: '100%'}}
          minWidth={150}
          maxWidth={250}
          className='sidebar control'
        >
          <SideBar state={state}/>
        </Resizable>
        <div className='content'>
          <AddArtist />
        </div>
        {/* {this.getModal()} */}
      </div>
    )
  }

  getErrorPopover() {
    const state = this.props.state
    const now = new Date().getTime()
    const recentErrors = state.errors.filter((x) => now - x.time < 5000)
    const hasErrors = recentErrors.length > 0

    const errorElems = recentErrors.map(function (error, i) {
      return (<div key={i} className='error'>{error.message}</div>)
    })
    return (
      <div key='errors'
        className={'error-popover ' + (hasErrors ? 'visible' : 'hidden')}>
        <div key='title' className='title'>Error</div>
        {errorElems}
      </div>
    )
  }

  getModal() {
    const state = this.props.state
    if (!state.modal) return

    if (!lightMuiTheme) {
      const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default
      lightBaseTheme.fontFamily = fontFamily
      lightBaseTheme.userAgent = false
      lightMuiTheme = getMuiTheme(lightBaseTheme)
    }

    const ModalContents = Modals[state.modal.id]()
    return (
      <MuiThemeProvider muiTheme={lightMuiTheme}>
        <div key='modal' className='modal'>
          <div key='modal-background' className='modal-background' />
          <div key='modal-content' className='modal-content'>
            <ModalContents state={state} />
          </div>
        </div>
      </MuiThemeProvider>
    )
  }

  getView() {
    const state = this.props.state
    const View = Views[state.location.url()]()
    return (<View state={state} />)
  }
}

module.exports = App
