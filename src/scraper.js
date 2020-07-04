const cheerio = require('cheerio')

const scrapeLinks = (html) => {
  const $ = cheerio.load(html)
  const result = []
  // for the sake of simplicity, we're considering only html anchors
  $('a[href]').each((_, elem) => {
    result.push($(elem).attr('href'))
  })
  return result
}

module.exports = scrapeLinks
