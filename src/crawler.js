// The backlog is an array with dedupe rules
const createBacklog = (initial) => {
  const backlogArray = initial ? [initial] : []
  const backlogSet = new Set(backlogArray)
  const add = (items) => {
    if (!Array.isArray(items)) {
      items = [items]
    }
    items.forEach((item) => {
      if (!backlogSet.has(item)) {
        backlogArray.push(item)
        backlogSet.add(item)
      }
    })
  }
  const next = () => {
    const item = backlogArray.shift() // shift: breadth-first, pop: depth-first
    backlogSet.delete(item)
    return item
  }
  const size = () => {
    return backlogArray.length
  }
  return { add, next, size }
}

const createCrawler = ({ maxVisits = null, visitorFn }) => {
  const visitedNodes = new Set()
  const crawl = async (initial) => {
    const visitBacklog = createBacklog(initial)
    while (visitBacklog.size() > 0) {
      const node = visitBacklog.next()
      if (visitedNodes.has(node)) {
        continue // Sanity check: we've been here already
      }
      // we could improve performance calling more visitors concurrently
      const nextNodes = await visitorFn(visitedNodes.size, node)
      visitedNodes.add(node)
      if (nextNodes === null) {
        break
      }
      if (maxVisits !== null) {
        let visitSlotCount = maxVisits - visitedNodes.size - visitBacklog.size()
        while (visitSlotCount > 0 && nextNodes.length > 0) {
          const nextNode = nextNodes.shift()
          if (!visitedNodes.has(nextNode)) {
            visitBacklog.add(nextNode)
          }
          visitSlotCount = maxVisits - visitedNodes.size - visitBacklog.size()
        }
      } else {
        visitBacklog.add(nextNodes)
      }
    }
  }
  const getVisitCount = () => {
    return visitedNodes.size
  }
  return {
    crawl,
    getVisitCount,
  }
}

module.exports = { createCrawler, createBacklog }
