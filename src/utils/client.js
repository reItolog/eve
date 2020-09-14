const client = require('@sanity/client')

module.exports = client({
  projectId: 'd2mgkh8z',
  dataset: 'production',
  useCdn: true,
})
