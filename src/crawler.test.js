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
            children: [],
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
  const crawler = createCrawler(visitorFn)
  await crawler.crawl(tree)
  expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  expect(crawler.getVisitCount()).toEqual(6)
})

it('Interrupts crawling if visitorFn returns null', async () => {
  expect.assertions(2)
  const result = []
  const visitorFn = async (count, node) => {
    result.push(node.name)
    return null // interrupts after visiting the first node
  }
  const crawler = createCrawler(visitorFn)
  await crawler.crawl(tree)
  expect(result).toEqual(['a'])
  expect(crawler.getVisitCount()).toEqual(1)
})

describe('Cyclic graph', () => {
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
              children: [],
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

  it('visitorFn should limit the number of visits', async () => {
    expect.assertions(2)
    const result = []
    const visitorFn = async (count, node) => {
      result.push(node.name)
      if (count === 100) {
        return null // interrupts after visiting 101 nodes
      }
      return node.children
    }
    const crawler = createCrawler(visitorFn)
    await crawler.crawl(tree)
    expect(result.length).toEqual(101)
    expect(crawler.getVisitCount()).toEqual(101)
  })

  test('visitorFn should keep track of what it has already visited', async () => {
    expect.assertions(2)
    const result = []
    const visited = new Set()
    const visitorFn = async (count, node) => {
      visited.add(node)
      result.push(node.name)
      // returns only unvisited children
      return node.children.filter((child) => !visited.has(child))
    }
    const crawler = createCrawler(visitorFn)
    await crawler.crawl(tree)
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(crawler.getVisitCount()).toEqual(6)
  })
})
