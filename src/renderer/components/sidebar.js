const React = require('react')

const ArtistTree = require('./artist-tree')

class SideBar extends React.Component {
  constructor (props) {
    super(props)

    this.active = null

    this.onClickNode = this.onClickNode.bind(this)
  }

  render () {
    return (
      <div>
        <div className='button-wrapper'>
          <span className='add-source'></span>
          <span className='setting'></span>
        </div>
        <div className='tree'>
          <ArtistTree />
        </div>
      </div>
    )
  }

  onClickNode (node) {
    this.active = node
    this.props.history.push('/gallery/'+node.target.id)
  }
}

module.exports = SideBar