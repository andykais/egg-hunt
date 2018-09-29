import * as React from 'react'
import NotificationBanner from '../notification-banner'
import GithubClient from '../../github-client'

import styles from './index.module.css'

const validRepoNameRegex = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/

class RepoChooser extends React.PureComponent {
  state = {
    input: '',
    error: null,
    allowRequest: true
  }

  handleRepoInput = e => {
    this.setState({ input: e.target.value, error: null, allowRequest: true })
  }

  handleSubmit = async e => {
    e.preventDefault()
    const { input, allowRequest } = this.state
    if (!allowRequest) return

    if (input && validRepoNameRegex.test(input)) {
      this.setState({ allowRequest: false })
      const githubClient = new GithubClient(input)
      try {
        await githubClient.test()
        this.props.onRepoFetch({ repoClient: githubClient, repoName: input })
      } catch (e) {
        this.setState({
          error: {
            title: e.toString(),
            details: e.stack
          }
        })
      }
    } else
      this.setState({
        error: {
          title: 'Thats not a valid repo name!'
        }
      })
  }

  render() {
    const { error } = this.state
    return (
      <form onSubmit={this.handleSubmit} className={styles.form}>
        <NotificationBanner type="error" isOpen={error} message={error} />
        <label htmlFor="repoName">Repo Name</label>
        <input
          name="repoName"
          onChange={this.handleRepoInput}
          type="text"
          placeholder="andykais/egg-hunt"
        />
        <button>cache repo</button>
      </form>
    )
  }
}

export default RepoChooser
