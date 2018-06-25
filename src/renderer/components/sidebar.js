const React = require('react')

const { dispatcher } = require('../lib/dispatcher')

class SideBar extends React.Component {
  render () {
    return (
      <div></div>
    )
  }

  getAddButton () {
    return (
      <button onClick={dispatcher('addSource')} />
    )
  }
}

module.exports = SideBar