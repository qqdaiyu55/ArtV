const React = require('react')
const path = require('path')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
// const sharp = require('sharp')

class MediaList extends React.Component {
  constructor (props) {
    super(props)

    // this.dirPath = '/Users/daiyu/Desktop/The Art of Overwatch (2017) (Digital)/'
    this.dirPath = '/Users/daiyu/Desktop/test/'
  }

  render () {
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    let imageList =  this.props.data
    canvas.width = 200
    canvas.height = 200

    imageList = imageList.map((v, i) => {
      // let img = new Image()
      // let dataURL

      // img.onload = function () {
      //   let sx, sy, sideLen
      //   if (img.width < img.height) {
      //     sx = 0
      //     sy = Number((img.height - img.width) / 2)
      //     sideLen = img.width
      //   } else {
      //     sx = Number((img.width - img.height) / 2)
      //     sy = 0
      //     sideLen = img.height
      //   }

      //   context.drawImage(img, sx, sy, sideLen, sideLen, 0, 0, canvas.width, canvas.height)
      //   dataURL = canvas.toDataURL()
      //   document.getElementById('md-'+i.toString()).childNodes[0].src = dataURL
      // }
      // img.src = this.dirPath + v

      let thumbPath = '/Users/daiyu/Desktop/cache/' + path.parse(v).name + '_thumb' + path.extname(v)
      if (!fs.existsSync(thumbPath)) {
        // gm(this.dirPath).thumb(200, 200, thumbPath, 75, (err) => {
        //   if (err) throw err
        //   else console.log('create thumbnail for', v)
        // })
        gm(this.dirPath + v)
          .gravity('Center')
          .resize(400, 400, '^')
          .extent(400, 400)
          .write(thumbPath, function (err) {
            if (err) throw err
            else console.log('create thumbnail for', v)
          })
        // sharp(this.dirPath + v)
        //   .resize(200, 200)
        //   .toFile(thumbPath, (err, info) => {
        //     if (err) throw err
        //     else console.log('done')
        //   })
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