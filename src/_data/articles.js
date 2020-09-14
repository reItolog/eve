const client = require('../utils/client.js')
const groq = require('groq')
const blocksToHtml = require('@sanity/block-content-to-html')

const h = blocksToHtml.h

const serializers = {
  types: {
    blockImage: props => (
      h('div', { className: 'mv30 s:mv85' },
        h('figure', { className: 'a-fig mla f fc s:fr' }, 
          [
            h('div', { className: 'a-fig__img x rel' }, 
              [
                h('div', { className: 'aspect', style: '--aspect:' + (100 / props.node.asset.asset.metadata.dimensions.aspectRatio) + '%' }),
                h('img', { 'data-lazy-src': props.node.asset.asset.url, className: 'abs top left x y o-cover', alt: '' })
              ]
            ),
            h('figcaption', { className: 'mla mt5 s:mt0 x s:col6 gpr1 f085 lh180' }, props.node.caption),
          ]
        )
      )
    ),
    blockQuote: props => (
      h('div', { className: 'a-quote col22 mla mv30 s:mv85'}, 
        [
          h('blockquote', { className: 'rel f15 dark-grey mb10', cite: props.node.cite }, props.node.quote),
          h('cite', { className: 'f085 lh180' }, props.node.cite)
        ]
      )
    ),
  },
  marks: {
    em: (props) =>
      h('em', { className: 'purple fsn' }, props.children),
    strong: (props) =>
      h('strong', { className: 'fw300 purple' }, props.children),
    link: (props) =>
      h('a', {
        className: 'rel purple u-line',
        href: props.mark.href,
        target: '_blank',
        rel: 'noopener noreferrer',
      }, props.children),
  },
}

module.exports = async function() {
  const articles = await client.fetch(groq`*[_type == 'articles']{
    title,
    'slug': slug.current,
    length,
    'categories': categories[]->,
  	'author': author[]->{
      ... ,
      'photo': photo.asset->
     },
    'featuredImage': featuredImage.asset->,
  	'blockContent': blockContent[]{
      ...,
      _type == 'blockImage' => {
        ...,
        'asset': asset{asset->{...}}
      }
    },
    links
  }`)

  for (let i = 0; i < articles.length; i++) {
    const g = articles[i]
    if (g.blockContent) {
      g.blockContent = blocksToHtml({
        className: 'a-txt x s:col13 s:mla',
        blocks: g.blockContent,
        serializers: serializers
      })       
    }
  }

  return articles
}