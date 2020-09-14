import blockContent from '../blocks'

export default {
  title: 'Articles',
  name: 'articles',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200,
        slugify: input => input
        .toLowerCase()
        .replace(/\s+/g, '-')
        .slice(0, 200)
      }
    },
    {
      title: 'Length',
      name: 'length',
      type: 'string'
    },
    {
      title: 'Categories',
      name: 'categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            {type: 'categories'},
          ]
        }
      ]
    },
    {
      title: 'Author',
      name: 'author',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            {type: 'authors'},
          ]
        }
      ]
    },
    {
      title: 'Featured image',
      name: 'featuredImage',
      type: 'image'
    },
    blockContent,
    {
      title: 'Links',
      name: 'links',
      type: 'array',
      of: [
        {
          type: 'url',
        }
      ]
    },
  ]
}