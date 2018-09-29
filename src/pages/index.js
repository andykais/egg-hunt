import * as React from 'react'
import ErrorBoundary from '../components/error-boundary'
import RepoChooser from '../components/repo-chooser'
import FilterTool from '../components/filter-tool'
import FileComments from '../components/file-comments'
import findComments, { isParseable } from '../comment-finder'
import commentFilters from '../comment-finder/comment-filters'
import EggIcon from '../images/missing-icons/egg.svg'

import styles from './index.module.css'
import './global-styles.css'

class GithubCommentsPage extends React.Component {
  state = {
    repoName: null,
    repoClient: null,
    repoTree: [],
    fileComments: {},
    stats: {
      loadingTree: false,
      numFiles: 0,
      numFilesLoaded: 0
    },
    uiChoices: {
      hideFilesWithoutComments: true,
      expandAllComments: false,
      sortBy: 'numComments',
      sortDesc: true,
      filterBy: null // 'none', 'swears' || 'names'
    },
    uiRepoTree: []
  }
  handleRepoFetched = async ({ repoName, repoClient }) => {
    try {
      const stats = { loadingTree: true, numFiles: 0, numFilesLoaded: 0 }
      this.setState({
        repoName,
        repoClient,
        stats
      })
      const tree = []
      const fileComments = {}
      for await (const object of repoClient.tree()) {
        tree.push(object)
        const stateTree = [...tree]
        this.setState({
          repoTree: stateTree,
          uiRepoTree: stateTree,
          stats: { ...stats }
        })
      }
      for (const object of tree) {
        if (!object.body && isParseable(object.path)) {
          stats.numFiles++
          const content = await repoClient.getFileContent(object)
          stats.numFilesLoaded++
          const comments = findComments({ filename: object.path, content })

          fileComments[object.path] = comments
          this.setState({
            fileComments: { ...fileComments },
            stats: { ...stats }
          })
        }
      }
      stats.loadingTree = false
      this.setState({ stats: { ...stats } })
      this.handleUiChoicesChange(this.state.uiChoices, fileComments, tree)
    } catch (e) {
      console.log('handle repo fetched error')
      console.error(e)
    }
  }

  handleUiChoicesChange = (uiChoices, fileCommentsStatic, repoTreeStatic) => {
    const repoTree = repoTreeStatic || this.state.repoTree
    const fileComments = fileCommentsStatic || this.state.fileComments
    this.setState({ uiChoices })
    let uiRepoTree = repoTree

    if (uiChoices.hideFilesWithoutComments) {
      uiRepoTree = uiRepoTree.filter(
        file => fileComments[file.path] && fileComments[file.path].length
      )
    }
    console.log(uiChoices.filterBy, commentFilters[uiChoices.filterBy])
    if (commentFilters[uiChoices.filterBy]) {
      const filterFunc = commentFilters[uiChoices.filterBy]
      uiRepoTree = uiRepoTree.map(
        file =>
          fileComments[file.path] &&
          fileComments[file.path].filter(comment => filterFunc(comment.value))
      )
    }
    this.setState({ uiRepoTree })
  }

  render() {
    const { repoName, fileComments, uiRepoTree, stats, uiChoices } = this.state
    const isLoadingTree = stats.loadingTree
    const isLoadingFileContents =
      stats.loadingTree || stats.numFiles !== stats.numFilesLoaded
    return (
      <ErrorBoundary>
        <div className={styles.container}>
          <div className={styles.drawer}>
            <RepoChooser onRepoFetch={this.handleRepoFetched} />
            <FilterTool
              uiChoices={uiChoices}
              disableTools={isLoadingTree}
              onChange={this.handleUiChoicesChange}
            />
          </div>
          <div className={styles.verticalContainer}>
            <div className={styles.header}>
              <h1>egg-hunt</h1>
              <EggIcon />
            </div>
            <div className={styles.children}>
              {isLoadingTree && (
                <div className={styles.stats}>
                  {isLoadingTree && <div>finding files...</div>}
                  {isLoadingFileContents && (
                    <div>{`loaded ${stats.numFilesLoaded}/${
                      stats.numFiles
                    } files`}</div>
                  )}
                </div>
              )}

              <FileComments
                repoName={repoName}
                tree={uiRepoTree}
                fileComments={fileComments}
                expandAll={uiChoices.expandAllComments}
              />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }
}
export default GithubCommentsPage
