const createCrawler = require('./crawler')

let tree

beforeEach(() => {
  tree = {
    name: 'a',
    children: [
      {
        name: 'b',
        children: [
          {
            name: 'd',
            children: [],
          },
          {
            name: 'e',
            children: [
              {
                name: 'g',
                children: [],
              },
            ],
          },
        ],
      },
      {
        name: 'c',
        children: [
          {
            name: 'f',
            children: [],
          },
        ],
      },
    ],
  }
})

it('Does breadth-first crawl', async () => {
  expect.assertions(2)
  const result = []
  const visitorFn = async (count, node) => {
    result.push(node.name)
    return node.children
  }
  const crawler = createCrawler({ visitorFn })
  await crawler.crawl(tree)
  expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
  expect(crawler.getVisitCount()).toEqual(7)
})

it('Limits the number of visits (maxVisits)', async () => {
  expect.assertions(2)
  const result = []
  const visitorFn = async (count, node) => {
    result.push(node.name)
    return node.children
  }
  const crawler = createCrawler({ maxVisits: 3, visitorFn })
  await crawler.crawl(tree)
  expect(result).toEqual(['a', 'b', 'c'])
  expect(crawler.getVisitCount()).toEqual(3)
})

it('Interrupts crawling if visitorFn returns null', async () => {
  expect.assertions(2)
  const result = []
  const visitorFn = async (count, node) => {
    result.push(node.name)
    return null // interrupts after visiting the first node
  }
  const crawler = createCrawler({ visitorFn })
  await crawler.crawl(tree)
  expect(result).toEqual(['a'])
  expect(crawler.getVisitCount()).toEqual(1)
})

describe('Cyclic graph (beware of infinite loops!)', () => {
  beforeEach(() => {
    tree = {
      name: 'a',
      children: [
        {
          name: 'b',
          children: [
            {
              name: 'd',
              children: [],
            },
            {
              name: 'e',
              children: [
                {
                  name: 'g',
                  children: [],
                },
              ],
            },
          ],
        },
        {
          name: 'c',
          children: [
            {
              name: 'f',
              children: [],
            },
          ],
        },
      ],
    }
    // creates a loop
    tree.children[1].children[0].children = [tree]
  })

  it('Can avoid infinite loops by limiting the number of visits', async () => {
    expect.assertions(2)
    const result = []
    const visitorFn = async (count, node) => {
      result.push(node.name)
      return node.children
    }
    const crawler = createCrawler({ maxVisits: 100, visitorFn })
    await crawler.crawl(tree)
    expect(result.length).toEqual(100)
    expect(crawler.getVisitCount()).toEqual(100)
  })

  it('Can avoid infinite loops if visitorFn keeps track of what it has already visited', async () => {
    expect.assertions(2)
    const result = []
    const visited = new Set()
    const visitorFn = async (count, node) => {
      visited.add(node)
      result.push(node.name)
      // returns only unvisited children
      return node.children.filter((child) => !visited.has(child))
    }
    const crawler = createCrawler({ visitorFn })
    await crawler.crawl(tree)
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
    expect(crawler.getVisitCount()).toEqual(7)
  })
})
