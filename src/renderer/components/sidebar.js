const React = require('react')
const { withRouter } = require('react-router-dom')

const ArtistTree = require('./artist-tree')

class SideBar extends React.Component {
  constructor (props) {
    super(props)

    this.active = null

    this.onClickAddSource = this.onClickAddSource.bind(this)
  }

  render () {
    return (
      <div>
        <div className='button-wrapper'>
          <span className='add-source' onClick={this.onClickAddSource}></span>
          <span className='setting'></span>
        </div>
        <div className='tree'>
          <ArtistTree data={this.props.data} />
        </div>
      </div>
    )
  }

  onClickAddSource () {
    if (this.props.location.pathname != '/') {
      this.props.history.push('/')
    }
  }
}

module.exports = withRouter(SideBar)