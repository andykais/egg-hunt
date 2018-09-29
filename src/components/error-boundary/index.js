import * as React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { thrownError: null }
  }

  componentDidCatch(error, info) {
    console.log('ERROR')
    // Display fallback UI
    this.setState({ thrownError: error })
    // You can also log the error to an error reporting service
    console.error(error, info)
  }

  render() {
    const { thrownError } = this.state
    if (thrownError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
