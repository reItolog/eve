// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

import home from './documents/home'
import articles from './documents/articles'
import categories from './documents/categories'
import authors from './documents/authors'
import packages from './documents/packages'
import testimonials from './documents/testimonials'
import featured from './documents/featured'
import customer from './documents/customer'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    /* Your types here! */
    home,
    articles,
    categories,
    authors,
    packages,
    testimonials,
    featured,
    customer
  ])
})
