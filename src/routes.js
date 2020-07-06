const express = require('express')
const router = express.Router()
const createError = require('http-errors')

router.get('/pages', function (req, res, next) {
  async function listPages() {
    const { offset = 0, limit = 10 } = req.query
    const { mongodbClient } = req.app.locals
    const db = mongodbClient.db('crawler')
    const result = await db
      .collection('pages')
      .find({})
      .project({
        _id: 1,
        title: 1,
        url: 1,
        status: 1,
        statusText: 1,
        linkCount: 1,
        error: 1,
        updatedAt: 1,
      })
      .skip(Number(offset))
      .limit(Math.min(Number(limit), 100))
      .toArray()
    res.json(result)
  }
  listPages().catch((err) => next(err))
})

router.get('/pages/:id', function (req, res, next) {
  async function getPageById() {
    const { id: _id } = req.params
    const { mongodbClient } = req.app.locals
    const db = mongodbClient.db('crawler')
    const result = await db.collection('pages').find({ _id }).limit(1).toArray()
    if (result.length === 0) {
      throw createError(404)
    }
    res.json(result[0])
  }
  getPageById().catch((err) => next(err))
})

module.exports = router
