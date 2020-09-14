export default {
  title: 'Home',
  name: 'home',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Services title',
      name: 'servicesTitle',
      type: 'string'
    },
    {
      title: 'Services list',
      name: 'servicesList',
      type: 'array',
      of: [
        {
          title: 'Service',
          name: 'service',
          type: 'object',
          fields: [
            {
              title: 'Service heading',
              name: 'serviceHeading',
              type: 'string',
            },
            {
              title: 'Service text',
              name: 'serviceText',
              type: 'text'
            }
          ]
        }, 
      ],  
    },
    {
      title: 'Packages title',
      name: 'packagesTitle',
      type: 'string'
    },
    {
      title: 'Packages text',
      name: 'packagesText',
      type: 'text'
    },
    {
      title: 'Featured work title',
      name: 'featuredTitle',
      type: 'string'
    },
    {
      title: 'Summary title',
      name: 'summaryTitle',
      type: 'string'
    },
    {
      title: 'Summary text',
      name: 'summaryText',
      type: 'text'
    },
    {
      title: 'Testimonials title',
      name: 'testimonialsTitle',
      type: 'string'
    },
  ]
}