import * as React from 'react'

import styles from './index.module.css'

const sortOptions = {
  Nothing: null,
  'Date Modified': () => {},
  'Date Created': () => {}
}

const filterOptions = {
  Anything: null,
  'Swear Words': () => {},
  'Proper Names': () => {}
}

class FilterTool extends React.PureComponent {
  handleSortByChange = e => {
    this.props.onChange({
      ...this.props.uiChoices,
      sortBy: e.target.value
    })
  }

  handleSortDescChange = e => {
    this.props.onChange({
      ...this.props.uiChoices,
      sortDesc: e.target.value
    })
  }

  handleFilterByChange = e => {
    this.props.onChange({
      ...this.props.uiChoices,
      filterBy: e.target.value
    })
  }

  handleHideFilesChange = e => {
    this.props.onChange({
      ...this.props.uiChoices,
      hideFilesWithoutComments: e.target.checked
    })
  }

  handleExpandCommentsChange = e => {
    this.props.onChange({
      ...this.props.uiChoices,
      expandAllComments: e.target.checked
    })
  }

  render() {
    const { disableTools } = this.props
    const { hideFilesWithoutComments, expandAllComments } = this.props.uiChoices

    return (
      <form className={styles.form}>
        <fieldset disabled={disableTools && 'disabled'}>
          <div className={styles.input}>
            <label htmlFor="sortBy">Sort Comments By</label>
            <select name="sortBy" onChange={this.handleSortByChange}>
              {Object.keys(sortOptions).map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select name="sortDesc" onChange={this.handleSortByChange}>
              <option value="Descending">Descending</option>
              <option value="Ascending">Ascending</option>
            </select>
          </div>

          <div className={styles.input}>
            <label htmlFor="filterBy">Filter Comments By</label>
            <select name="filterBy" onChange={this.handleFilterByChange}>
              {Object.keys(filterOptions).map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.input} ${styles.checkboxContainer}`}>
            <input
              className={styles.checkbox}
              name="hideFilesWithoutComments"
              type="checkbox"
              checked={hideFilesWithoutComments}
              onChange={this.handleHideFilesChange}
            />
            <label
              className={styles.checkboxLabel}
              htmlFor="hideFilesWithoutComments"
            >
              Hide Files Without Comments
            </label>
          </div>

          <div className={`${styles.input} ${styles.checkboxContainer}`}>
            <input
              className={styles.checkbox}
              name="expandAllComments"
              type="checkbox"
              checked={expandAllComments}
              onChange={this.handleExpandCommentsChange}
            />
            <label className={styles.checkboxLabel} htmlFor="expandAllComments">
              Expand All Comments
            </label>
          </div>
        </fieldset>
      </form>
    )
  }
}

export default FilterTool
