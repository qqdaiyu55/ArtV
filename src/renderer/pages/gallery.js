const React = require('react')
const InfiniteScroll = require('react-infinite-scroller')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const config = require('../../config')
const MediaList = require('../components/medialist')

class Gallery extends React.Component {
  constructor (props) {
    super(props)

    this.size = 20

    this.state = {
      thumbnailNum: 0,
      imageNum: -1,
      images: [],
      showedImages: [],
      hasMoreItems: false,
      start: 0
    }

    this.init = this.init.bind(this)
    this.getMediaList = this.getMediaList.bind(this)
    this.createThumbnail = this.createThumbnail.bind(this)
    this.loadContent = this.loadContent.bind(this)
  }

  render () {
    // Set loader for infinite scroll component
    const loader = <div className="loader-inner line-scale scroll-loader"></div>

    const artistId = this.props.match.params.id
    const thumbFolderPath = path.join(config.THUMBNAIL_PATH, artistId)

    return (
      this.state.thumbnailNum == this.state.imageNum
        ? <div className='gallery'>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.loadContent}
              hasMore={this.state.hasMoreItems}
              loader={loader}
              useWindow={false}
            >
              <MediaList data={this.state.showedImages} folderPath={thumbFolderPath} />
            </InfiniteScroll>
          </div>
        : <h1>{this.state.thumbnailNum}</h1>
    )
  }

  componentWillReceiveProps (nextProps) {
    console.log(nextProps.match.params.id)
    if (this.props.match.params.id != nextProps.match.params.id) {
      const artistId = nextProps.match.params.id

      this.setState({
        thumbnailNum: 0,
        imageNum: -1,
        images: [],
        showedImages: [],
        hasMoreItems: false,
        start: 0
      })

      this.init(artistId)
    }
  }

  componentWillMount () {
    console.log('will mount')
    console.log(this.props)
    
    // get Artist id, which is also the element id on side tree
    const artistId = this.props.match.params.id

    this.init(artistId)
  }

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

    const imgPath = artistData.path
    const thumbFolderPath = path.join(config.THUMBNAIL_PATH, artistId)

    // Check if the thumbnail folder exists
    if (!fs.existsSync(thumbFolderPath)) {
      fs.mkdirSync(thumbFolderPath)
    }

    const mediaList = this.getMediaList(imgPath)

    this.createThumbnail(mediaList, imgPath, thumbFolderPath)
  }

  getMediaList (dirPath) {
    const exts = ['jpg', 'jpeg', 'gif', 'png', 'tiff', 'gif', 'bmp']

    let files = fs.readdirSync(dirPath)
    let images = files.filter(file => exts.includes(path.extname(file).replace('.', '')))
    let hasMoreItems = images.length > 0 ? true : false

    this.setState({
      images: images,
      imageNum: images.length,
      hasMoreItems: hasMoreItems
    })
    
    return images
  }

  createThumbnail (mediaList, imgPath, thumbFolderPath) {
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
        sharp(path.join(imgPath, v))
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
    if (this.state.start >= this.state.imageNum) {
      this.setState({ hasMoreItems: false })
    } else {
      let showedImages = this.state.showedImages
      let start = this.state.start
      let moreImages = this.state.images.slice(start, start + this.size)

      moreImages = moreImages.map((v) => {
        return path.parse(v).name + '_thumb' + path.extname(v)
      })

      showedImages = showedImages.concat(moreImages)
      this.setState({
        showedImages: showedImages,
        start: start + this.size
      })
    }
  }
}

module.exports = Gallery