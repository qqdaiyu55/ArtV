const RSSParser = require('rss-parser')

let parser = new RSSParser()
parser.parseURL('http://wanimal1983.org/rss', function (err, feed) {
  console.log(feed.title)
  feed.items.forEach(function (entry) {
    console.log(entry.title + ':' + entry.link)
  })
})