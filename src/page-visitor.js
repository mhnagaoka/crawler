const axios = require('axios').default
const url = require('url')
const { URL } = url
const scrapeLinks = require('./scraper')

const createPageVisitor = () => {
  const visited = new Set()
  const pageVisitor = async (count, node) => {
    const current = url.format(new URL(node), { fragment: false })
    // We've been here before. Abort.
    if (visited.has(current)) {
      return []
    }
    let response
    let error
    const scrapedLinks = []
    try {
      // Fetch page contents, scrape links
      response = await axios.get(current, {
        responseType: 'text',
      })
      error = null
      scrapedLinks.push(...scrapeLinks(response.data))
    } catch (err) {
      response = null
      error = err
    }
    const absoluteLinks = scrapedLinks.reduce((sum, link) => {
      try {
        // Convert to absolute links
        const absoluteLink = url.format(new URL(link, current), {
          fragment: false,
        })
        // Ignore links already visited and non-page links
        if (
          visited.has(absoluteLink) ||
          current === absoluteLink ||
          !absoluteLink.startsWith('http')
        ) {
          return sum
        }
        // Add to the resulting array
        sum.push(absoluteLink)
        return sum
      } catch (err) {
        return sum
      }
    }, [])
    // Dedupe
    const uniqueLinks = [...new Set(absoluteLinks)]
    // TODO persist url, uniqueLinks
    visited.add(current)
    if (response) {
      console.log(
        `count=${count} url=${current} status=${response.status} ${response.statusText} length=${response.headers['content-length']} totalLinks=${scrapedLinks.length} uniqueLinks=${uniqueLinks.length}`
      )
    } else {
      console.error(`count=${count} url=${current} error=${error.message}`)
    }
    return uniqueLinks
  }
  return pageVisitor
}

module.exports = createPageVisitor
