const createCrawler = (visitorFn) => {
  let visitCount = 0
  const crawl = async (initial) => {
    const nodeBacklog = [initial]
    while (nodeBacklog.length > 0) {
      const node = nodeBacklog.shift() // shift: breadth-first, pop: depth-first
      // we could improve performance calling more visitors concurrently
      const nextNodes = await visitorFn(visitCount, node)
      visitCount++
      if (nextNodes === null) {
        break
      }
      nodeBacklog.push(...nextNodes)
    }
  }
  const getVisitCount = () => {
    return visitCount
  }
  return {
    crawl,
    getVisitCount,
  }
}

module.exports = createCrawler
