const cheerio = require('cheerio')

const scrape = (html) => {
  const $ = cheerio.load(html)
  const title = $('head title').text()
  const links = []
  // for the sake of simplicity, we're considering only html anchors
  $('a[href]').each((_, elem) => {
    links.push($(elem).attr('href'))
  })
  return { title, links }
}

module.exports = scrape
