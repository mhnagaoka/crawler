const { createCrawler, createBacklog } = require('./crawler')

describe('Crawl acyclic graph', () => {
  let graph

  beforeEach(() => {
    graph = {
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
    await crawler.crawl(graph)
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
    await crawler.crawl(graph)
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
    await crawler.crawl(graph)
    expect(result).toEqual(['a'])
    expect(crawler.getVisitCount()).toEqual(1)
  })
})

describe('Crawl cyclic graph (beware of infinite loops!)', () => {
  let graph

  beforeEach(() => {
    graph = {
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
    graph.children[1].children[0].children = [graph]
  })

  it('Can avoid infinite loops by limiting the number of visits', async () => {
    expect.assertions(2)
    const result = []
    const visitorFn = async (count, node) => {
      result.push(node.name)
      return node.children
    }
    const crawler = createCrawler({ maxVisits: 5, visitorFn })
    await crawler.crawl(graph)
    expect(result.length).toEqual(5)
    expect(crawler.getVisitCount()).toEqual(5)
  })

  it('Can avoid infinite loops by keeping track of what it has already visited', async () => {
    expect.assertions(2)
    const result = []
    const visitorFn = async (count, node) => {
      result.push(node.name)
      // returns only unvisited children
      return node.children
    }
    const crawler = createCrawler({ visitorFn })
    await crawler.crawl(graph)
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
    expect(crawler.getVisitCount()).toEqual(7)
  })
})

describe('Backlog', () => {
  let backlog

  beforeEach(() => {
    backlog = createBacklog(1)
    backlog.add(2)
    backlog.add(3)
  })

  it('Preserves the order of added items', () => {
    expect(backlog.next()).toEqual(1)
    expect(backlog.next()).toEqual(2)
    expect(backlog.next()).toEqual(3)
  })

  it('Keeps track of its size', () => {
    expect(backlog.size()).toEqual(3)
  })

  it('Avoids duplicate items', () => {
    backlog.add(4)
    backlog.add(3) // duplicate
    backlog.add(5)
    backlog.add(2) // duplicate
    backlog.add(6)
    backlog.add(1) // duplicate
    backlog.add(7)
    expect(backlog.size()).toEqual(7)
    expect(backlog.next()).toEqual(1)
    expect(backlog.next()).toEqual(2)
    expect(backlog.next()).toEqual(3)
    expect(backlog.next()).toEqual(4)
    expect(backlog.next()).toEqual(5)
    expect(backlog.next()).toEqual(6)
    expect(backlog.next()).toEqual(7)
  })

  it('Should return undefined if getting next item of empty backlog', () => {
    expect(backlog.next()).toEqual(1)
    expect(backlog.next()).toEqual(2)
    expect(backlog.next()).toEqual(3)
    expect(backlog.next()).toBeUndefined()
  })
})
