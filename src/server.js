const { MongoClient } = require('mongodb')
const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const routes = require('./routes')

process.on('unhandledRejection', (error) => {
  console.error(error.stack)
  process.exit(1)
})

const createMongodbClient = () => {
  const mongodbUrl = process.env.MONGODB_URL
  return MongoClient.connect(mongodbUrl, {
    poolSize: process.env.MONGODB_POOL_SIZE || 5,
    useUnifiedTopology: true,
  })
}

const main = async () => {
  const app = express()

  app.locals.mongodbClient = await createMongodbClient()

  app.use(logger('dev'))
  app.use(express.json())

  app.use('/', routes)

  // catch 404 and forward to error handler
  // eslint-disable-next-line no-unused-vars
  app.use(function (req, res, next) {
    next(createError(404))
  })

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error message
    const status = err.status || 500
    res.status(status)
    res.json({
      error: {
        status,
        message: status === 500 ? 'Internal error' : err.message,
      },
    })

    if (status === 500) {
      console.error(err.stack)
    }
  })

  const port = process.env.PORT || 3000

  app.listen(port, () => console.log(`Server is listening: port=${port}`))
}

main()
