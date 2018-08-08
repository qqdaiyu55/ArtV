const React = require('react')

class ContextMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      show: props.show
    }
  }

  render () {
    const style = {
      display: this.state.show ? 'block' : 'None',
      position: 'fixed',
      left: (this.props.pageX+3).toString()+'px',
      top: this.props.pageY.toString()+'px',
      color: 'black',
      background: 'white',
      width: '100px',
      height: '100px'
    }

    return (
      <div style={style} className='context-menu'>
        {this.props.title}
      </div>
    )
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ show: nextProps.show })
  }

  // Hide the context menu when clicking on anywhere on page other than context menu itself
  componentDidMount () {
    document.getElementsByTagName("BODY")[0].onclick = (e) => {
      if (e.target.className !== 'context-menu') {
        this.setState({ show: false })
      }
    }
  }
}

module.exports = ContextMenu