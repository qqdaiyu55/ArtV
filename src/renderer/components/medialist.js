const React = require('react')
const path = require('path')

class MediaList extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const folderPath = this.props.folderPath
    let thumbnailList =  this.props.data

    thumbnailList = thumbnailList.map((v, i) => {
      return (
        <div id={'thumbnail-id-'+i.toString()} className='artwork'>
          <img src={path.join(folderPath, v.toString())} />
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