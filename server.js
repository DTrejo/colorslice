var http = require('http');
var path = require('path')
var ErrorPage = require('error-page')

var ecstatic = require('ecstatic');
var PUBLIC = path.join(__dirname + '/' + 'public')
var static = ecstatic({ root: PUBLIC, autoIndex: true })

var stylus = require('./stylus')

var PORT = 8080
// var IS_PROD = process.env.NODE_ENV === 'production'

http.createServer(function(req, res) {
  res.error = ErrorPage(req, res, { debug: true })

  return stylus(req, res, function(er) {
    if (er) return res.error(er)
    return static(req, res)
  })
}).listen(8080)

console.log('serving dtrejo.com on http://localhost:' + PORT
  + ' with ecstatic@' + ecstatic.version + ' & node@' + process.version
)
