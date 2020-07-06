# Crawler

It comprises of two main modules: a crawler used to crawl web pages and populate the database and a REST API server that shows the web page information stored in the database.

## Building and Running with Docker

Build the image.

```
$ docker build -t crawler .
```

Start the REST API server.

_You need to adjust the MongoDB connection string according to your server._

```
$ docker run --rm -d --name crawler -p 3000:3000 \
-e MONGODB_URL="mongodb+srv://<user>:<password>@<host>/<db>?retryWrites=true&w=majority" \
crawler
```

Query the REST API server.

_The examples below use jq to format the JSON responses in a human-readable way._

```
$ curl -s 'http://localhost:3000/pages?offset=0&limit=5' | jq .
$ curl -s 'http://localhost:3000/pages/1bab3f16e219f6242b86db0c18e33cfd' | jq .
```

Start crawling a web page. The example below starts a crawler that visits 100 pages beginning at `https://www.crawler-test.com/`.

_You need to adjust the MongoDB connection string according to your server._

```
$ docker run --rm -it \
-e MONGODB_URL="mongodb+srv://<user>:<password>@<host>/<db>?retryWrites=true&w=majority" \
crawler bin/crawl --maxVisits 100 https://www.crawler-test.com/
```
