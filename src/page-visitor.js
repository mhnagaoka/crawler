const axios = require('axios').default
const url = require('url')
const { URL } = url
const scrapeLinks = require('./scraper')

const createPageVisitor = () => {
  const visited = new Set()
  const pageVisitor = async (count, node) => {
    const current = url.format(new URL(node), { fragment: false })
    try {
      const response = await axios.get(current, {
        responseType: 'text',
      })
      const links = scrapeLinks(response.data)
      visited.add(current)
      const absoluteLinks = links.reduce((sum, link) => {
        const absoluteLink = url.format(new URL(link, current), {
          fragment: false,
        })
        if (visited.has(absoluteLink) || !absoluteLink.startsWith('http')) {
          return sum
        }
        sum.push(absoluteLink)
        // console.log(link, absoluteLink.toString())
        return sum
      }, [])
      // TODO persist url, absoluteLinks
      console.log(
        `count=${count} url=${current} status=${response.status} length=${response.headers['content-length']} totalLinks=${links.length} filteredLinks=${absoluteLinks.length}`
      )
      return absoluteLinks
    } catch (err) {
      console.error(`Error visiting ${current}: ${err.message}`)
      return []
    }
  }
  return pageVisitor
}

module.exports = createPageVisitor
