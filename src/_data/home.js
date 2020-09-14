const client = require('../utils/client.js')
const groq = require('groq')

module.exports = async function() {
  const home = await client.fetch(groq`*[_type == 'home']{
    ...,
  }[0]`)

  return home
}