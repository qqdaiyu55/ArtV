const React = require('react')
const InfiniteScroll = require('react-infinite-scroller')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const sharp = require('sharp')

const config = require('../../config')
const MediaList = require('../components/medialist')

class Gallery extends React.Component {
  constructor (props) {
    super(props)

    this.size = 30
    this.initState = {
      type: undefined,

      thumbnailNum: 0,
      imageNum: -1,

      showedImages: [],
      hasMoreItems: false,

      // for local images
      images: [],
      start: 0,

      // for artstation
      page: 1,

      artistInfo: {}
    }

    this.artstationProcjetUrl = 'https://www.artstation.com/users/username/projects.json'

    this.state = this.initState

    this.init = this.init.bind(this)
    this.getLocalMediaList = this.getLocalMediaList.bind(this)
    this.createThumbnail = this.createThumbnail.bind(this)
    this.loadContent = this.loadContent.bind(this)
  }

  render () {
    // Set loader for infinite scroll component
    const loader = <div className="loader-inner line-scale scroll-loader"></div>

    const MediaListWrapper = 
      <div className='gallery'>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadContent}
          hasMore={this.state.hasMoreItems}
          loader={loader}
          useWindow={false}
        >
          <MediaList data={this.state.showedImages} />
        </InfiniteScroll>
      </div>
    
    let wrapper
    if (this.state.type == 'local') {
      wrapper =
        this.state.thumbnailNum == this.state.imageNum
          ? MediaListWrapper
          : <h1>{this.state.thumbnailNum}</h1>
    }
    if (this.state.type == 'artstation') {
      const data = this.state.artistInfo

      wrapper = 
        <div>
          <div className='artist-masthead' style={{backgroundImage: 'url('+data.coverUrl+')'}}>
            <div className='overlay'></div>
            <div className='artist-info'>
              <div className='avatar'>
                <img src={data.avatarUrl} />
              </div>
              <div className='text'>
                <h1>{data.name}</h1>
                <p>{data.headline}</p>
              </div>
            </div>
          </div>
          {MediaListWrapper}
        </div>
    }

    return wrapper
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.id != nextProps.match.params.id) {
      const artistId = nextProps.match.params.id

      this.setState(this.initState)

      this.init(artistId)
    }
  }

  componentWillMount () {
    console.log('will mount')
    
    // get Artist id, which is also the element id on side tree
    const artistId = this.props.match.params.id

    this.init(artistId)
  }

  // Fetch the data of artist and initialize given the artist key from artist tree
  init (artistId) {
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

    const data = JSON.parse(document.getElementById('data-artists').getAttribute('data-artists'))
    let artistData

    loop(data, artistId, (item, index, arr) => {
      artistData = item
    })

    this.setState({ type: artistData.type })

    if (artistData.type == 'local') {
      const imgPath = artistData.path
      const thumbFolderPath = path.join(config.THUMBNAIL_PATH, artistId)

      // Check if the thumbnail folder exists
      if (!fs.existsSync(thumbFolderPath)) {
        fs.mkdirSync(thumbFolderPath)
      }

      const mediaList = this.getLocalMediaList(imgPath)

      this.createThumbnail(mediaList, thumbFolderPath)
    }

    if (artistData.type == 'artstation') {
      axios.get(artistData.userInfoUrl)
        .then((resp) => {
          this.setState({
            hasMoreItems: true,
            artistInfo: {
              name: resp.data.full_name,
              avatarUrl: resp.data.large_avatar_url,
              coverUrl: resp.data.default_cover_url,
              headline: resp.data.headline,
              city: resp.data.city,
              country: resp.data.country,
              username: resp.data.username
            }
          })
        })
    }
  }

  // Case: local
  // Get images list of the selected folder
  getLocalMediaList (dirPath) {
    const exts = ['jpg', 'jpeg', 'gif', 'png', 'tiff', 'gif', 'bmp']

    let files = fs.readdirSync(dirPath)
    let images = files.filter(file => exts.includes(path.extname(file).replace('.', '')))
    images = images.map((v, i) => {
      return path.join(dirPath, v)
    })
    let hasMoreItems = images.length > 0 ? true : false

    this.setState({
      images: images,
      imageNum: images.length,
      hasMoreItems: hasMoreItems
    })
    
    return images
  }

  // Case: local
  // Create thumbnails for local images
  createThumbnail (mediaList, thumbFolderPath) {
    // List for images whose thumbnails do not exist in the thumbnail folder
    let missingList = []

    mediaList.forEach((v) => {
      let thumbFilePath = path.join(thumbFolderPath, path.parse(v).name + '_thumb' + path.extname(v))

      if (!fs.existsSync(thumbFilePath)) {
        missingList.push(v)
      }
    })

    if (missingList.length > 0) {
      this.setState({ thumbnailNum: mediaList.length - missingList.length })

      missingList.forEach((v) => {
        let thumbFilePath = path.join(thumbFolderPath, path.parse(v).name + '_thumb' + path.extname(v))

        // Use `sharp` to generate thumbnail
        sharp(v)
          .resize(400, 400)
          .toFile(thumbFilePath, (err, info) => {
            if (err) throw err
            else {
              // Update the number of thumbnails in the thumbnail folder
              let thumbnailNum = this.state.thumbnailNum
              thumbnailNum = thumbnailNum + 1
              this.setState({ thumbnailNum })
            }
          })
      })
    } else {
      this.setState({ thumbnailNum: mediaList.length })
    }
  }
  
  loadContent () {
    if (this.state.type == 'local') {
      const artistId = this.props.match.params.id
      const thumbFolderPath = path.join(config.THUMBNAIL_PATH, artistId)

      if (this.state.start >= this.state.imageNum) {
        this.setState({ hasMoreItems: false })
      } else {
        let showedImages = [...this.state.showedImages]
        let start = this.state.start
        let moreImages = this.state.images.slice(start, start + this.size)

        moreImages = moreImages.map((v) => {
          return {
            type: 'local',
            src: path.join(thumbFolderPath, path.parse(v).name + '_thumb' + path.extname(v))
          }
        })

        showedImages = showedImages.concat(moreImages)
        this.setState({
          showedImages: showedImages,
          start: start + this.size
        })
      }
    }

    if (this.state.type == 'artstation') {
      const artistProjectUrl = this.artstationProcjetUrl.replace('username', this.state.artistInfo.username) + '?page=' + this.state.page.toString()

      axios.get(artistProjectUrl)
        .then((resp) => {
          if (resp.data.data.length != 0) {
            let showedImages = [...this.state.showedImages]
            let moreImages = resp.data.data

            moreImages = moreImages.map((v) => {
              return {
                type: 'artstation',
                src: v.cover.thumb_url,
                title: v.title
              }
            })

            showedImages = showedImages.concat(moreImages)
            let page = this.state.page + 1
            this.setState({
              showedImages,
              page
            })
          } else {
            this.setState({ hasMoreItems: false })
          }
        })
    }
  }
}

module.exports = Gallery