const React = require('react')
const Tree = require('react-ui-tree')
const cx = require('classnames')

const { dispatcher } = require('../lib/dispatcher')

class SideBar extends React.Component {
  render () {
    const artistTree = this.props.state.saved.artistTree

    return (
      <div>
        <div className='button-wrapper'>
          <span className='add-source'></span>
          <span className='setting'></span>
        </div>
        <div className='tree'>
          <Tree
            paddingLeft={15}
            tree={artistTree}
            renderNode={this.renderNode}
          />
        </div>
      </div>
    )
  }

  renderNode (node) {
    return (
      <span>
        {node.module}
      </span>
    )
  }

  onClickNode (node) {
    this.setState({
      active: node
    })
  }
}

module.exports = SideBar