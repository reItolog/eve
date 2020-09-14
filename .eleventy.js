module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('static')
  eleventyConfig.addPassthroughCopy('browserconfig.xml')
  eleventyConfig.addPassthroughCopy('site.webmanifest')
  
  eleventyConfig.addFilter('split', (x, ch) => {
    return x ? x.split(ch) : ''
  })

  eleventyConfig.addFilter('find', (arr, key, val) => {
    return arr.find((item) => item[key] === val)
  })

  return {
    dir: { 
      input: 'src', 
      data: '_data',
      includes: '_includes',
      output: 'dist', 
    },
    passthroughFileCopy: true,
    templateFormats: ['njk', 'md', 'css', 'html', 'yml'],
    htmlTemplateEngine: 'njk'
  }
}