import CommentParser from './file-parser'

const loaders = [
  {
    test: /.(js|go)$/,
    options: {
      CDI: '//',
      CDO: '/*',
      CDC: '*/'
    }
  },
  {
    test: /.(sh|agc)$/,
    options: {
      CDI: '#'
    }
  },
  {
    test: /.asm$/,
    options: {
      CDI: ';'
    }
  }
].map(o => ({
  ...o,
  parser: new CommentParser(o.options)
}))

export default ({ filename, content }) => {
  const loader = loaders.find(p => p.test.test(filename))

  if (loader) {
    try {
      const comments = loader.parser.extractComments(content)
      const stitchedComments = []
      let stitched = comments ? comments[0] : null
      for (let i = 1; i < comments.length; i++) {
        // const prev = comments[i - 1]
        const current = comments[i]

        if (
          stitched.type === 'inline' &&
          current.type === 'inline' &&
          stitched.line + stitched.lineBreaks + 1 === current.line &&
          stitched.col === current.col
        ) {
          stitched.value += '\n' + current.value
          stitched.lineBreaks++
        } else {
          stitchedComments.push(stitched)
          stitched = current
        }
      }
      if (stitched) stitchedComments.push(stitched)
      return stitchedComments
    } catch (e) {
      console.error(filename, 'FUECK UP')
      throw e
    }
  }
}

export const isParseable = filename =>
  Boolean(loaders.find(p => p.test.test(filename)))
