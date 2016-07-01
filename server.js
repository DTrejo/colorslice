var http = require('http')
var path = require('path')

var ErrorPage = require('error-page')
var ecstatic = require('ecstatic')

var PUBLIC = path.join(__dirname, 'public')
var PORT = 8080
// var IS_PROD = process.env.NODE_ENV === 'production'

var static = ecstatic({ root: PUBLIC, autoIndex: true })

// recompile .styl files on change
var stylus = require('stylus').middleware({ src: PUBLIC })

// recompile js bundles on change
var jsfiles =
  [ path.join(PUBLIC, 'js', 'colorslice.js')
  , path.join(PUBLIC, 'js', 'recolor.js')
  , path.join(PUBLIC, 'js', 'colorscheme.js')
  , path.join(PUBLIC, 'js', 'csscolors.js') ]
var bundles = require('browserify-watcher')(jsfiles)

http.createServer(function(req, res) {
  res.error = ErrorPage(req, res, { debug: true })

  return stylus(req, res, function(er) {
    if (er) return res.error(er)

    return static(req, res)
  })
}).listen(PORT)

process.on('uncaughtException', function(err) {
  console.log('uncaughtException', err.stack)
  process.exit(0)
})

console.log('serving dtrejo.com on http://localhost:' + PORT
  + ' with ecstatic@' + ecstatic.version + ' & node@' + process.version
)
