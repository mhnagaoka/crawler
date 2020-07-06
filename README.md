# Crawler

It comprises of two main modules:

- a REST API server that shows the web page information stored in the database
- a CLI crawler used to crawl web pages and populate the database and .

## Building and Running with Docker

Build the image.

```
$ docker build -t crawler .
```

Start the REST API server.

_You need to adjust the MongoDB connection string according to your server._

```shell
$ docker run --rm -d --name crawler -p 3000:3000 \
-e MONGODB_URL="mongodb+srv://<user>:<password>@<host>/<db>?retryWrites=true&w=majority" \
crawler
```

Query the REST API server.

_The examples below use jq to format the JSON responses in a human-readable way._

```shell
$ curl -s 'http://localhost:3000/pages?offset=0&limit=5' | jq .
$ curl -s 'http://localhost:3000/pages/1bab3f16e219f6242b86db0c18e33cfd' | jq .
```

Start crawling a web page. The example below starts a crawler that visits 100 pages beginning at `https://www.crawler-test.com/`.

_You need to adjust the MongoDB connection string according to your server._

```shell
$ docker run --rm -it \
-e MONGODB_URL="mongodb+srv://<user>:<password>@<host>/<db>?retryWrites=true&w=majority" \
crawler bin/crawl --maxVisits 100 https://www.crawler-test.com/
```

## Developing

You need at Node.js version 12 or above (it will probably work on other versions with proper [async/await support](https://node.green/#ES2017-features-async-functions)).

Create a `.env` file containing the MONGODB_URL variable.

_You need to adjust the MongoDB connection string according to your server._

```shell
$ echo MONGODB_URL="mongodb+srv://<user>:<password>@<host>/<db>?retryWrites=true&w=majority" > .env
```

Install dependencies.

```shell
$ npm install
```

Run unit tests continuously and code.

```shell
$ npm run test:watch
```

Debug the REST API server.

```shell
npm start
```

Debug the crawler CLI.

```shell
$ npm run cli:debug -- --maxVisits 1 https://www.crawler-test.com/
```

### Tools

You may want to run the commands above (to debug stuff) in a terminal within Visual Studio Code because it auto-attaches its debugger.

Visual Studio Code is automatically configured to reformat code on save. You will need its Prettier, ESLint and EditorConfig extensions.

There is also a Husky git commit hook to run ESLint and Prettier before any git commit.
