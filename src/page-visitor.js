const axios = require('axios').default
const crypto = require('crypto')
const url = require('url')
const { URL } = url
const scrape = require('./scraper')

const createPageVisitor = (mongodbClient) => {
  const visited = new Set()
  const pageVisitor = async (count, node) => {
    const current = url.format(new URL(node), { fragment: false })
    // We've been here before. Abort.
    if (visited.has(current)) {
      return []
    }
    let response
    let error
    let title
    const scrapedLinks = []
    try {
      // Fetch page contents, scrape links
      response = await axios.get(current, {
        responseType: 'text',
      })
      error = null
      const scraped = scrape(response.data)
      title = scraped.title
      scrapedLinks.push(...scraped.links)
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

    // persist url, uniqueLinks
    const db = mongodbClient.db('crawler')
    // each page is identified by its url (we're using md5 here to keep it reasonably small)
    const _id = crypto.createHash('md5').update(current).digest('hex')
    const document = {
      url: current,
      title,
      status: response ? response.status : null,
      statusText: response ? response.statusText : null,
      error: error ? error.message : null,
      links: uniqueLinks,
      linkCount: uniqueLinks.length,
      updatedAt: new Date(),
    }
    await db
      .collection('pages')
      .updateOne({ _id }, { $set: document }, { upsert: true })

    visited.add(current)
    if (response) {
      console.log(
        `count=${count} url=${current} title=${title} status=${response.status} ${response.statusText}`,
        `length=${response.headers['content-length']} totalLinks=${scrapedLinks.length} uniqueLinks=${uniqueLinks.length}`
      )
    } else {
      console.error(`count=${count} url=${current} error=${error.message}`)
    }
    return uniqueLinks
  }
  return pageVisitor
}

module.exports = createPageVisitor
