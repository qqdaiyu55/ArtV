const React = require('react')
const Tree = require('react-ui-tree')

const { dispatcher } = require('../lib/dispatcher')

class SideBar extends React.Component {
  render () {
    const tree = {
      "module": "react-ui-tree",
      "children": [{
        "collapsed": true,
        "module": "dist",
        "children": [{
          "module": "node.js"
        }]
      }]
    }

    return (
      <div>
        <div className='button-wrapper'>
          <span className='add-source'></span>
          <span className='setting'></span>
        </div>
        <div className='tree'>
          <Tree
            paddingLeft={15}
            tree={tree}
            renderNode={this.renderNode}
          />
        </div>
      </div>
    )
  }

  getAddButton () {
    return (
      <button onClick={dispatcher('addSource')} />
    )
  }

  renderNode (node) {
    return (
      <span>
        {node.module}
      </span>
    )
  }
}

module.exports = SideBar