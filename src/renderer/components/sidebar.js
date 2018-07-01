const React = require('react')
const Tree = require('react-ui-tree')
const cx = require('classnames')
const {
  withRouter
} = require('react-router-dom')

class SideBar extends React.Component {
  constructor (props) {
    super(props)

    this.active = null

    this.onClickNode = this.onClickNode.bind(this)
    this.renderNode = this.renderNode.bind(this)
  }

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
            isNodeCollapsed={this.isNodeCollapsed}
            tree={artistTree}
            renderNode={this.renderNode}
          />
        </div>
      </div>
    )
  }

  renderNode (node) {
    return (
      <span
        className={cx('node', {
          'is-active': node === this.active
        })}
        onClick={this.onClickNode}
      >
        {node.module}
      </span>
    )
  }

  onClickNode (node) {
    this.active = node
    this.props.history.push('/gallery')
  }
}

module.exports = withRouter(SideBar)