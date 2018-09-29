import Filter from 'bad-words'

// const { list: words } = new Filter()
const filter = new Filter()

const swearWords = comment => filter.isProfane(comment)

const properNames = comment => false

export default {
  'Swear Words': swearWords,
  'Proper Names': properNames
}
