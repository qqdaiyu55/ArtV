const React = require('react')
const { withRouter } = require('react-router-dom')
const Tree = require('rc-tree').default
const { TreeNode } = require('rc-tree')

class ArtistTree extends React.Component {
  constructor () {
    this.state = {
      gData: [{ title: 'test', key: 'test-key', children: [{ title: 'child1', key: 'child-1'}, { title: 'child2', key: 'child-2' }]}, { title: 'Overwatch', key: 'test-key-2', children: [{title:'wlop', key:'ow-1'}]}],
      expandedKeys: ['test-key']
    }

    this.onDrop = this.onDrop.bind(this)
    this.collaspse = this.collaspse.bind(this)
    this.onSelect = this.onSelect.bind(this)
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

    return (
      <Tree
        expandedKeys={this.state.expandedKeys}
        defaultExpandParent={true}
        draggable={true}
        onDrop={this.onDrop}
        onSelect={this.onSelect}
      >
        {loop(this.state.gData)}
      </Tree>
    )
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

  collaspse (selectedKey) {
    let expandedKeys = [...this.state.expandedKeys]

    if (expandedKeys.includes(selectedKey)) {
      expandedKeys.splice(expandedKeys.indexOf(selectedKey), 1)
    } else {
      expandedKeys.push(selectedKey)
    }

    this.setState({
      expandedKeys
    })
  }

  onSelect (selectedKey, e) {
    if (!e.node.isLeaf()) {
      this.collaspse(e.node.props.eventKey)
    }
  }
}

module.exports = withRouter(ArtistTree)