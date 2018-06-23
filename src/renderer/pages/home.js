const React = require('react')
const InfiniteScroll = require('react-infinite-scroller')
const fs = require('fs')
const path = require('path')

const MediaList = require('../components/medialist')

class Home extends React.Component {
  constructor () {
    this.dirPath = '/Users/daiyu/Desktop/The Art of Overwatch (2017) (Digital)/'
    // this.dirPath = '/Users/daiyu/Desktop/test/'
    this.size = 20

    this.state = {
      allImages: [],
      images: [],
      hasMoreItems: false,
      start: 0
    }

    this.getMediaList = this.getMediaList.bind(this)
    this.loadContent = this.loadContent.bind(this)
  }

  render () {
    const loader = <div className="loader-inner line-scale scroll-loader"></div>

    return (
      <div className='content'>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadContent}
          hasMore={this.state.hasMoreItems}
          loader={loader}
          useWindow={false}
        >
          <MediaList data={this.state.images} />
        </InfiniteScroll>
      </div>
    )
  }

  componentWillMount () {
    this.getMediaList(this.dirPath)
  }

  getMediaList (dirPath) {
    let exts = ['jpg', 'jpeg', 'gif', 'png', 'tiff', 'gif', 'bmp']
    fs.readdir(dirPath, (err, files) => {
      if (err) throw err

      let images = files.filter(file => exts.includes(path.extname(file).replace('.', '')))

      this.setState({
        allImages: images,
        hasMoreItems: true
      })
    })
  }

  loadContent () {
    if (this.state.start >= this.state.allImages.length) {
      this.setState({ hasMoreItems: false })
    } else {
      let images = this.state.images
      let start = this.state.start
      let moreImages = this.state.allImages.slice(start, start + this.size)

      images = images.concat(moreImages)
      this.setState({
        images: images,
        start: start + this.size
      })
    }
  }
}

module.exports = Home