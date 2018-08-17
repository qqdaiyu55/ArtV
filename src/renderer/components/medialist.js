const React = require('react')
const path = require('path')

class MediaList extends React.Component {
  constructor (props) {
    super(props)
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
        <div key={'thumbnail-'+i.toString()} className='artwork'>
          <div className='overlay'></div>
          <img src={v.src} />
          {artworkInfo}
        </div>
      )
    })

    return (
      <div className='artworks-wrapper'>
        {thumbnailList}
      </div>
    )
  }
}

module.exports = MediaList