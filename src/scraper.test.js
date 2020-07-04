const { promisify } = require('util')
const fs = require('fs')
const readFileAsync = promisify(fs.readFile)
const scrapeLinks = require('./scraper')

it('Scrapes links from single anchor', () => {
  const result = scrapeLinks('<a href="https://github.com">Github</a>')
  expect(result).toEqual(['https://github.com'])
})

it('Scrapes links from multiple anchors', () => {
  const result = scrapeLinks(`
  <a href="https://github.com">Github</a>
  <a href="https://gitlab.com">Gitlab</a>
  `)
  expect(result).toEqual(['https://github.com', 'https://gitlab.com'])
})

it('Should ignore anchors with no reference', () => {
  const result = scrapeLinks(`
  <a>Null</a>
  <a href="https://gitlab.com">Gitlab</a>
  `)
  expect(result).toEqual(['https://gitlab.com'])
})

it('Should ignore non-anchor elements', () => {
  const result = scrapeLinks(`
  <link rel="stylesheet" href="/styles/default.css"/>
  <a href="https://gitlab.com">Gitlab</a>
  `)
  expect(result).toEqual(['https://gitlab.com'])
})

it('Should handle nested elements properly', () => {
  const result = scrapeLinks(`
  <a href="https://gitlab.com">Gitlab or <a href="https://github.com">Github</a></a>
  `)
  expect(result).toEqual(['https://gitlab.com', 'https://github.com'])
})

it('Scrapes links from a huge html file', async () => {
  expect.assertions(2)
  const html = await readFileAsync('./test-data/wikipedia-denis-ritchie.mhtml')
  const result = scrapeLinks(html)
  expect(result.length).toBeGreaterThan(0)
  expect(result).toContain('/wiki/Unix')
})
