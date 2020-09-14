const client = require('../utils/client.js')
const groq = require('groq')

module.exports = async function() {
  const packages = await client.fetch(groq`*[_type == 'packages']{
    ...,
    'image': image.asset->
  }`)

  return packages
}