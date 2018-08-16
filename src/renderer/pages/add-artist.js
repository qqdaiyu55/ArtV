const React = require('react')
const axios = require('axios')
const url = require('url')

const { dispatch, dispatcher } = require('../lib/dispatcher')

class AddArtist extends React.Component {
  constructor () {
    this.type = ['artstation', 'pixiv']
    this.prefixURL = {
      artstation: 'https://www.artstation.com/',
      pixiv: 'https://www.pixiv.net/member.php?'
    }
    this.artstationArtistQuery = 'https://www.artstation.com/users/username/quick.json'

    this.state = {
      error: '',
      searchTerm: {
        type: undefined,
        user: ''
      },
      searchResults: []
    }

    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.addArtistToSideBar = this.addArtistToSideBar.bind(this)
  }

  render () {
    let searchResults = this.state.searchResults
    searchResults = searchResults.map((v, i) => {
      return (
        <div className='artist-info' key={v.name}>
          <div className='avatar' onClick={this.addArtistToSideBar}>
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
    if (e.key === 'Enter' && e.target.value != '' && this.state.error == '') {
      if (this.state.searchTerm.type == 'artstation') {
        userInfoUrl = this.artstationArtistQuery.replace('username', this.state.searchTerm.user)
        axios.get(userInfoUrl)
          .then((resp) => {
            this.setState({
              searchResults: [{
                type: 'artstation',
                name: resp.data.full_name,
                avatarUrl: resp.data.medium_avatar_url,
                username: resp.data.username,
                userInfoUrl: userInfoUrl,
                id: resp.data.id
              }]
            })
          })
      }
    }
  }

  // Set the state when search term is changed
  //  * Check if the input url is valid
  //  * Judge the type: rss, artstation, pixiv
  handleChange (e) {
    const parsedURL = url.parse(e.target.value)
    let type = undefined, i

    for (i = 0; i < this.type.length; i = i + 1) {
      if (parsedURL.hostname && parsedURL.hostname.includes(this.type[i])) {
        type = this.type[i]
        break
      }
    }

    if (type === undefined) {
      this.setState({ error: 'invalid url' })
    }

    // Artstation support
    if (type == 'artstation') {
      if (parsedURL.href.includes(this.prefixURL['artstation'])) {
        let username = parsedURL.pathname.replace('/', '')

        this.setState({
          error: '',
          searchTerm: {
            type: 'artstation',
            user: username
          }
        })
      } else {
        this.setState({ error: 'invalid artstation url' })
      }
    }

    // Pixiv support
    if (type == 'pixiv') {
      if (parsedURL.href.includes(this.prefixURL['pixiv'])) {
        
      }
    }
  }

  addArtistToSideBar() {
    let data = this.state.searchResults[0]
    dispatch('addArtist', data)
  }
}

module.exports = AddArtist