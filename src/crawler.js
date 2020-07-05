const createCrawler = ({ maxVisits = null, visitorFn }) => {
  const visited = new Set()
  const crawl = async (initial) => {
    const nodeBacklog = [initial]
    while (nodeBacklog.length > 0) {
      const node = nodeBacklog.shift() // shift: breadth-first, pop: depth-first
      if (visited.has(node)) {
        continue // we've been here already
      }
      // we could improve performance calling more visitors concurrently
      const nextNodes = await visitorFn(visited.size, node)
      visited.add(node)
      if (nextNodes === null) {
        break
      }
      if (maxVisits !== null) {
        const pendingVisits = maxVisits - visited.size - nodeBacklog.length
        pendingVisits > 0 &&
          nodeBacklog.push(...nextNodes.slice(0, pendingVisits))
      } else {
        nodeBacklog.push(...nextNodes)
      }
    }
  }
  const getVisitCount = () => {
    return visited.size
  }
  return {
    crawl,
    getVisitCount,
  }
}

module.exports = createCrawler
