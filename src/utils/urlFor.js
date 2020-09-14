const client = require('./client.js')
const imageUrlBuilder = require('@sanity/image-url')

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

module.exports = urlFor
