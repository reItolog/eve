const blockImage = {
  title: 'Image',
  name: 'blockImage',
  type: 'object',
  fields: [
    {
      title: 'Asset',
      name: 'asset',
      type: 'image'
    },
    {
      title: 'Caption',
      name: 'caption',
      type: 'string'
    }
  ]
}

const blockQuote = {
  title: 'Quote',
  name: 'blockQuote',
  type: 'object',
  fields: [
    {
      title: 'Quote',
      name: 'quote',
      type: 'text'
    },
    {
      title: 'Cite',
      name: 'cite',
      type: 'string'
    }
  ]
}

const blockContent = {
  name: 'blockContent',
  type: 'array',
  of: [
    {
      type: 'block'
    },
    blockImage,
    blockQuote
  ]
}

export default blockContent