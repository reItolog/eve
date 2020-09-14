export default {
  title: 'Packages',
  name: 'packages',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Image',
      name: 'image',
      type: 'image'
    },
    {
      title: 'Video url',
      name: 'videoUrl',
      type: 'url'
    },
    {
      title: 'Description',
      name: 'description',
      type: 'text'
    },
    {
      title: 'Bullet points',
      name: 'list',
      type: 'array',
      of: [
        {
          title: 'Bullet point',
          name: 'bulletPoint',
          type: 'string',
        }
      ]
    }
  ]
}