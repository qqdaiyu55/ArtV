const React = require('react')
const axios = require('axios')

const { dispatcher } = require('../lib/dispatcher')

class AddArtist extends React.Component {
  constructor () {
    this.state = {
      searchTerm: 'https://www.artstation.com/users/kuvshinov_ilya',
      searchResults: []
    }

    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  render () {
    let searchResults = this.state.searchResults
    console.log(searchResults)
    searchResults = searchResults.map((v, i) => {
      return (
        <div className='artist-info'>
          <div className='avatar'>
            <img src={v.avatarUrl} />
          </div>
          <h4 className='name'>{v.name}</h4>
        </div>
      )
    })

    return (
      <div>
        <div className='add-artist'>
          <div id='search' className='search'>
          <input onKeyUp={this.handleKeyUp} onChange={this.handleChange} type='search' placeholder='Search for  an artist' />
            <span className='open-folder' onClick={dispatcher('openFolder')}></span>
          </div>
          <p>Support Artstation, pixiv now</p>
        </div>
        <div className='search-results'>
          {searchResults}
        </div>
      </div>
    )
  }

  // Process the search
  handleKeyUp (e) {
    if (e.key === 'Enter' && this.state.searchTerm !== '') {
      axios.get('https://www.artstation.com/users/kuvshinov_ilya/quick.json')
        .then((resp) => {
          console.log(resp.data)
          this.setState({
            searchResults: [{
              type: 'artstation',
              name: resp.data.full_name,
              avatarUrl: resp.data.medium_avatar_url,
              username: resp.data.username
            }]
          })
        })
    }
  }

  // Set the state when search term is changed
  handleChange (e) {
    // this.setState({ searchTerm: e.target.value })
  }
}

module.exports = AddArtist