const React = require('react')
const { withRouter } = require('react-router-dom')
const Tree = require('rc-tree').default
const { TreeNode } = require('rc-tree')

const ContextMenu = require('./context-menu')

class ArtistTree extends React.Component {
  constructor (props) {
    this.state = {
      gData: props.data,
      expandedKeys: [],

      contextMenuInfo: {
        display: false,
        pageX: 0,
        pageY: 0,
        key: undefined,
        title: undefined
      }
    }

    this.onDragEnter = this.onDragEnter.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.collaspse = this.collaspse.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onRightClick = this.onRightClick.bind(this)
  } 

  render () {
    const loop = (data) => {
      return data.map((item) => {
        if (item.children && item.children.length) {
          return <TreeNode key={item.key} title={item.title} className='parent-node'>{loop(item.children)}</TreeNode>
        }
        return <TreeNode key={item.key} title={item.title} className='leaf-node' />
      })
    }

    const contextMenuInfo = this.state.contextMenuInfo

    return (
      <div>
        <Tree
          expandedKeys={this.state.expandedKeys}
          defaultExpandParent={true}
          draggable={true}
          onDragEnter={this.onDragEnter}
          onDrop={this.onDrop}
          onSelect={this.onSelect}
          onRightClick={this.onRightClick}
        >
        {loop(this.state.gData)}
        </Tree>
        <ContextMenu
          show={contextMenuInfo.display}
          pageX={contextMenuInfo.pageX}
          pageY={contextMenuInfo.pageY}
          title={contextMenuInfo.title}
        />
        <div id='data-artists' data-artists={JSON.stringify(this.state.gData)} style={{display: 'None'}}></div>
      </div>
    )
  }

  onDragEnter (info) {
    this.collaspse(info.node.props.eventKey, true)
  }

  onDrop (info) {
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const isDropItemLeaf = info.node.isLeaf()

    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]) // -1 or 1, respectively indicate two positions: before and after the dropped item

    // loop function
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }

    const data = [...this.state.gData]

    // Get the dragged item
    let dragObj
    if (info.dropToGap || !isDropItemLeaf) {
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1)
        dragObj = item
      })
    }

    // If the item is dragged to gap
    if (info.dropToGap) {
      let ar, i

      // Get the dropped item
      loop(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })

      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }
    // If the item is dragged to a parent node (collection)
    else if (!isDropItemLeaf) {
      loop(data, dropKey, (item) => {
        item.children.push(dragObj)
      })
    }

    this.setState({ gData: data })
  }

  collaspse (selectedKey, alwaysExpand=false) {
    let expandedKeys = [...this.state.expandedKeys]

    if (!expandedKeys.includes(selectedKey)) {
      expandedKeys.push(selectedKey)
    } else if (!alwaysExpand) {
      expandedKeys.splice(expandedKeys.indexOf(selectedKey), 1)
    }

    this.setState({
      expandedKeys
    })
  }

  // Click the node:
  //  1. for parent node (collection): expand the collection or not
  //  2. for leaf node (artist): jump to artist page
  onSelect (selectedKey, e) {
    if (!e.node.isLeaf()) {
      this.collaspse(e.node.props.eventKey)
    } else {
      this.props.history.push('/gallery/' + e.node.props.eventKey)
    }
  }

  // Right click to pop out context menu
  onRightClick (info) {
    this.setState({
      contextMenuInfo: {
        display: true,
        pageX: info.event.pageX,
        pageY: info.event.pageY,
        key: info.node.props.eventKey,
        title: info.node.props.title
      }
    })
  }
}

module.exports = withRouter(ArtistTree)