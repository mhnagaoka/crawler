const createCrawler = require('./crawler')
const createPageVisitor = require('./page-visitor')

console.log(process.argv)

const initialUrl = process.argv[2]
const maxVisits = Number(process.argv[3])
const pageVisitor = createPageVisitor({ maxVisits })
const crawler = createCrawler(pageVisitor)
crawler.crawl(initialUrl)
