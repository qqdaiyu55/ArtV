const React = require('react')
const path = require('path')

class MediaList extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    let thumbnailList =  this.props.data

    thumbnailList = thumbnailList.map((v, i) => {
      return (
        <div key={'thumbnail-'+i.toString()} className='artwork'>
          <div className='overlay'></div>
          <img src={v} />
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