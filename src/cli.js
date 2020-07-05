const createCrawler = require('./crawler')
const createPageVisitor = require('./page-visitor')

console.log(process.argv)

const initialUrl = process.argv[2]
const maxVisits = Number(process.argv[3])
const visitorFn = createPageVisitor()
const crawler = createCrawler({ maxVisits, visitorFn })
crawler.crawl(initialUrl)
