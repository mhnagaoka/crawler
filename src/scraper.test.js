const { promisify } = require('util')
const fs = require('fs')
const readFileAsync = promisify(fs.readFile)
const scrapeLinks = require('./scraper')

it('Scrapes links from single anchor', () => {
  const scraped = scrapeLinks('<a href="https://github.com">Github</a>')
  expect(scraped.links).toEqual(['https://github.com'])
})

it('Scrapes links from multiple anchors', () => {
  const scraped = scrapeLinks(`
  <a href="https://github.com">Github</a>
  <a href="https://gitlab.com">Gitlab</a>
  `)
  expect(scraped.links).toEqual(['https://github.com', 'https://gitlab.com'])
})

it('Should ignore anchors with no reference', () => {
  const scraped = scrapeLinks(`
  <a>Null</a>
  <a href="https://gitlab.com">Gitlab</a>
  `)
  expect(scraped.links).toEqual(['https://gitlab.com'])
})

it('Should ignore non-anchor elements', () => {
  const scraped = scrapeLinks(`
  <link rel="stylesheet" href="/styles/default.css"/>
  <a href="https://gitlab.com">Gitlab</a>
  `)
  expect(scraped.links).toEqual(['https://gitlab.com'])
})

it('Should handle nested elements properly', () => {
  const scraped = scrapeLinks(`
  <a href="https://gitlab.com">Gitlab or <a href="https://github.com">Github</a></a>
  `)
  expect(scraped.links).toEqual(['https://gitlab.com', 'https://github.com'])
})

it('Scrapes links from a huge html file', async () => {
  expect.assertions(3)
  const html = await readFileAsync('./test-data/wikipedia-denis-ritchie.mhtml')
  const scraped = scrapeLinks(html)
  expect(scraped.title).toEqual('Dennis Ritchie - Wikipedia')
  expect(scraped.links.length).toBeGreaterThan(0)
  expect(scraped.links).toContain('/wiki/Unix')
})
