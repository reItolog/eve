const client = require('../utils/client.js')
const groq = require('groq')

module.exports = async function() {
  const testimonials = await client.fetch(groq`*[_type == 'testimonials']{
    ...,
    'image': image.asset->,
    'logo': logo.asset->
  }`)

  return testimonials
}