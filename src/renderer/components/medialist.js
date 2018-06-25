const React = require('react')
const path = require('path')
const fs = require('fs')
// const gm = require('gm').subClass({ imageMagick: true })
const sharp = require('sharp')

class MediaList extends React.Component {
  constructor (props) {
    super(props)

    // this.dirPath = '/Users/daiyu/Desktop/The Art of Overwatch (2017) (Digital)/'
    this.dirPath = '/Users/daiyu/Desktop/test/'
  }

  render () {
    let imageList =  this.props.data

    imageList = imageList.map((v, i) => {
      let thumbPath = '/Users/daiyu/Desktop/cache/' + path.parse(v).name + '_thumb' + path.extname(v)
      if (!fs.existsSync(thumbPath)) {
        sharp(this.dirPath + v)
          .resize(400, 400)
          .toFile(thumbPath, (err, info) => {
            if (err) throw err
            else console.log('done')
          })
      }

      return (
        <div id={'md-'+i.toString()} className='artwork'>
          <img src={thumbPath} />
        </div>
      )
    })

    return (
      <div className='artworks-wrapper'>
        {imageList}
      </div>
    )
  }
}

module.exports = MediaList