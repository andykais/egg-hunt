import * as React from 'react'

import styles from './index.module.css'

class File extends React.Component {
  state = {
    isOpen: false
  }

  handleContainerClick = e => {
    const { comments = [] } = this.props

    if (comments.length) this.setState(state => ({ isOpen: !state.isOpen }))
  }

  render() {
    const { file, comments, urlBase, expandAll } = this.props
    const { isOpen } = this.state

    return (
      <div className={`${styles.content} ${file ? '' : styles.downloading}`}>
        <div onClick={this.handleContainerClick} className={styles.title}>
          <span className={styles.link}>
            <a href={`${urlBase}${file.path}`}>{file.path.substr(1)}</a>
          </span>
          <span>{`${comments.length} Comments`}</span>
        </div>
        {(isOpen || expandAll) && (
          <div className={styles.comments}>
            {comments.map(comment => {
              return (
                <div className={styles.comment} key={comment.line}>
                  {comment.value.split('\n').map((line, i) => (
                    <React.Fragment key={`${comment.line}-${i}`}>
                      <div className={styles.lineLink}>
                        <a href={`${urlBase}${file.path}#L${comment.line}`}>
                          {comment.line + i}
                        </a>
                      </div>
                      <div className={styles.commentLine}>
                        <span>{line}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
}

class FileComments extends React.PureComponent {
  render() {
    const { repoName, tree, fileComments, expandAll } = this.props
    return repoName ? (
      <div className={styles.fileContainer}>
        {tree.map(file => {
          const comments = fileComments[file.path] || []
          const urlBase = `https://github.com/${repoName}/blob/master`

          return (
            <File {...{ urlBase, file, comments, expandAll }} key={file.path} />
          )
        })}
      </div>
    ) : (
      <div className={styles.emptyState}>
        <h2>Try Entering a Github repo on the left!</h2>
      </div>
    )
  }
}

export default FileComments
