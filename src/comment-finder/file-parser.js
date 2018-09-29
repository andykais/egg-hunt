import moo from 'moo'

const escapeRegexChars = str => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

const getInlineCommentRegex = CDI => {
  if (CDI) {
    const cdiStr = escapeRegexChars(CDI)
    return new RegExp(`${cdiStr}.*$`)
    // return new RegExp(String.raw`([ ]*${cdiStr}.*?\n)*[ ]*${cdiStr}.*?$`)
  }
}

const getMultilineRegex = (CDO, CDC) => {
  if (CDO && CDC) {
    const cdoStr = escapeRegexChars(CDO)
    const cdcStr = escapeRegexChars(CDC)
    return new RegExp(`${cdoStr}[\\s\\S]*?${cdcStr}`)
  }
}

class CommentParser {
  constructor({ CDI, CDO, CDC }) {
    const inline = getInlineCommentRegex(CDI)
    const multiline = getMultilineRegex(CDO, CDC)

    const tokens = {
      WS: /[ \t]+/,
      SingleQuoteString: /"(?:\\["\\]|[^[\n\r]"\\])*?"/,
      DoubleQuoteString: /'(?:\\['\\]|[^[\n\r]"\\])*?'/,
      BacktickString: /`(?:\\[`\\]|[^"\\])*?`/,
      inline,
      multiline: {
        match: multiline,
        lineBreaks: true
      },
      garbage: /.+?/,
      NL: { match: /[\n\r]/, lineBreaks: true }
    }

    Object.keys(tokens).forEach(
      key => (tokens[key] === undefined ? delete tokens[key] : '')
    )

    this.tokens = tokens
    this.acceptedTypes = ['inline', 'multiline']
  }

  extractComments = codeStr => {
    const lexer = moo.compile(this.tokens)
    lexer.reset(codeStr)

    const comments = []
    let next

    while ((next = lexer.next())) {
      if (this.acceptedTypes.includes(next.type)) {
        comments.push(next)
      }
    }
    return comments
  }
}

export default CommentParser
