const React = require('react')
const axios = require('axios')
const Vibrant = require('node-vibrant')

class MediaList extends React.Component {
  constructor (props) {
    super(props)

    this.artstationProjectUrl = 'https://www.artstation.com/projects/'

    this.state = {
      showViewer: false,
      viewerData: [],
      index: -1
    }

    this.openViewer = this.openViewer.bind(this)
    this.closeViewer = this.closeViewer.bind(this)
    this.getViewer = this.getViewer.bind(this)
    this.jumpToArtwork = this.jumpToArtwork.bind(this)
    this.previousArtwork = this.previousArtwork.bind(this)
    this.nextArtwork = this.nextArtwork.bind(this)
  }

  render () {
    let thumbnailList =  this.props.data

    thumbnailList = thumbnailList.map((v, i) => {
      let artworkInfo = undefined

      if (v.type == 'artstation') {
        artworkInfo = <div className='title'><h4>{v.title}</h4></div>
      }

      if (v.type == 'rss') {
        artworkInfo = <div className='title'><h4>{v.title}</h4></div>
      }

      return (
        <div key={'thumbnail-'+i.toString()} className='artwork' onClick={() => this.openViewer(i)}>
          <div className='overlay'></div>
          <img src={v.src} />
          {artworkInfo}
        </div>
      )
    })

    return (
      <div className='artworks-wrapper'>
        {thumbnailList}
        {this.getViewer()}
      </div>
    )
  }

  openViewer (idx) {
    this.setState({ showViewer: true })
    this.jumpToArtwork(idx)
  }

  closeViewer () {
    this.setState({
      showViewer: false,
      viewerData: [],
      index: -1
    })
  }

  getViewer () {
    const artworks = this.state.viewerData.map((v) => {
      return (
        <div className='image'>
          <img src={v} />
        </div>
      )
    })

    const showLeftArrow = this.state.index > 0 ? true : false
    const showRightArrow = this.state.index + 1 < this.props.data.length ? true : false

    return (
      <div className={'viewer ' + (this.state.showViewer ? 'visible' : 'hidden')}>
        <div className={'viewer-wrapper ' + (this.state.viewerData.length == 1 ? 'single' : '')}>
          {showLeftArrow && <div className='arrow arrow-previous' onClick={this.previousArtwork}></div>}
          {showRightArrow && <div className='arrow arrow-next' onClick={this.nextArtwork}></div>}
          <div className='artwork-images'>
            {artworks}
          </div>
        </div>
        <span className='close-button' onClick={this.closeViewer}></span>
      </div>
    )
  }

  jumpToArtwork (idx) {
    const data = this.props.data[idx]

    if (data.type == 'local') {
      let assets = [ data.orignalSrc ]

      this.setState({
        viewerData: assets,
        index: idx
      })
    }

    if (data.type == 'artstation') {
      axios.get(this.artstationProjectUrl + data.hashId + '.json')
        .then((resp) => {
          let assets = resp.data.assets

          assets = assets.map((v) => {
            if (v.has_image) return v.image_url
          })
          this.setState({
            viewerData: assets,
            index: idx
          })

          // Vibrant.from(resp.data.assets[0].image_url).getPalette((err, palette) => console.log(palette))
        })
    }

    if (data.type == 'rss') {
      let assets = [ data.src ]

      this.setState({
        viewerData: assets,
        index: idx
      })
    }
  }

  previousArtwork () {
    let previousIndex = this.state.index - 1
    this.jumpToArtwork(previousIndex)
  }

  nextArtwork () {
    let nextIndex = this.state.index + 1
    this.jumpToArtwork(nextIndex)
  }
}

module.exports = MediaList