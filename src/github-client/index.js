import promisify from 'util.promisify'
import mixinIndexedDb from 'js-git/mixins/indexed-db'
import mixinAddCache from 'js-git/mixins/add-cache'
import mixinGithubDb from 'js-github/mixins/github-db'
import mixinCreateTree from 'js-git/mixins/create-tree'
import mixinMemCache from 'js-git/mixins/mem-cache'
import mixinReadCombiner from 'js-git/mixins/read-combiner'
import mixinFormats from 'js-git/mixins/formats'
import mixinWalkers from 'js-git/mixins/walkers'

// TODO investigate if this messes with old methods
const mixinFormatsFixed = repo => {
  const loadAs = repo.loadAs
  repo.loadAs = newLoadAs

  function newLoadAs(type, hash, callback) {
    if (!callback) return newLoadAs.bind(repo, type, hash)
    var realType = type === 'text' ? 'blob' : type === 'array' ? 'tree' : type

    const onLoadText = (err, body, hash) => {
      let bodyStr = ''
      for (let i = 0; i < body.length; i++) {
        bodyStr += String.fromCharCode(body[i])
      }
      body = bodyStr
      return callback(err, body, hash)
    }

    if (type === 'text') return loadAs.call(repo, realType, hash, onLoadText)
    else return loadAs(type, hash, callback)
  }
}

class GithubClient {
  constructor(githubRepoName) {
    this.githubRepoName = githubRepoName
    // Start out the normal way with a plain object.
    const repo = {}

    // Mixin the main library using github to provide the following:
    // - repo.loadAs(type, hash) => value
    // - repo.saveAs(type, value) => hash
    // - repo.listRefs(filter='') => [ refs ]
    // - repo.readRef(ref) => hash
    // - repo.updateRef(ref, hash) => hash
    // - repo.deleteRef(ref) => null
    // - repo.createTree(entries) => hash
    // - repo.hasHash(hash) => has
    mixinGithubDb(
      repo,
      githubRepoName,
      'd8dab5919930651aec0d4cf1cbd9341c4e2866a8'
    )

    // Github has this built-in, but it's currently very buggy so we replace with
    // the manual implementation in js-git.
    mixinCreateTree(repo)

    // Cache github objects locally in indexeddb
    mixinAddCache(repo, mixinIndexedDb)

    // Cache everything except blobs over 100 bytes in memory.
    // This makes path-to-hash lookup a sync operation in most cases.
    mixinMemCache(repo)

    // Combine concurrent read requests for the same hash
    mixinReadCombiner(repo)

    // Add in value formatting niceties.  Also adds text and array types.
    mixinFormats(repo)
    mixinFormatsFixed(repo)

    mixinWalkers(repo)

    mixinIndexedDb.init(function(err) {
      if (err) throw err
    })

    // wrap the repo functions in promises
    const repoP = Object.keys(repo).reduce(
      (acc, key) => ({
        ...acc,
        [key]: promisify(repo[key])
      }),
      {}
    )

    this._repo = repo
    this.repo = repoP
  }

  test = async () => {
    try {
      const headHash = await this.repo.readRef('refs/heads/master')
      if (!headHash) throw new Error('Failed to fetch refs/heads/master')
    } catch (e) {
      console.log('test error occurred')
      console.error(e)
    }
  }

  tree = async function*() {
    try {
      console.log(this.repo)
      const headHash = await this.repo.readRef('refs/heads/master')
      console.log({ headHash })
      const commit = await this.repo.loadAs('commit', headHash)
      console.log({ commit })
      // const tree = await this.repo.loadAs('tree', commit.tree)
      const stream = await this.repo.treeWalk(commit.tree)
      stream.read = promisify(stream.read)

      let object
      while ((object = await stream.read())) {
        if (!object.body) yield object
      }
    } catch (e) {
      console.log('tree error occurred')
      console.error(e)
    }
  }

  getFileContent = async fileObject => {
    try {
      const content = await this.repo.loadAs('text', fileObject.hash)
      return content
    } catch (e) {
      console.log('content error ocurred')
      console.error(e)
    }
  }

  getAuthorOfLine = async (filename, lineNumber) => {}
}

export default GithubClient
