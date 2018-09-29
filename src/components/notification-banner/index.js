import * as React from 'react'

class NotificationBanner extends React.PureComponent {
  render() {
    const { type, isOpen, message } = this.props
    const backgroundColor = type === 'error' ? 'red' : 'none'
    if (isOpen)
      return (
        <div style={{ backgroundColor }}>
          <h2>{message.title}</h2>
          {message.details && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {message.details}
            </details>
          )}
        </div>
      )
    else return null
  }
}

export default NotificationBanner
