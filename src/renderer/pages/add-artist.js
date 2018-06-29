const React = require('react')

const { dispatcher } = require('../lib/dispatcher')

class AddArtist extends React.Component {
  render () {
    return (
      <div className='add-artist'>
        <div id='search' className='search'>
          <input onKeyUp={this.handleKeyUp} onChange={this.handleChange} type='search' placeholder='Search for an artist' />
          <span className='open-folder' onClick={dispatcher('openFolder')}></span>
        </div>
        <p>Support Artstation, pixiv now</p>
      </div>
    )
  }

  handleKeyUp () {

  }

  handleChange () {

  }
}

module.exports = AddArtist