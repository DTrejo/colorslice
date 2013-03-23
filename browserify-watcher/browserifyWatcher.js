module.exports = browserifyWatcher

var path = require('path')
var fs = require('fs')
var browserify = require('browserify')

//
// Takes a path to a js file, outputs browserified version, e.g.
// dir/filename.js -> dir/filename.min.js
//
function browserifyWatcher (jsfiles) {
  if (typeof jsfiles == 'string') jsfiles = [ jsfiles ]

  var bundles = []
  jsfiles.forEach(function(mainjs) {
    var b = browserify({ watch: true, debug: true })
    bundles.push(b)
    b.addEntry(mainjs)

    var newname = path.basename(mainjs, '.js') + '.min.js'
    var output = path.join(path.dirname(mainjs), newname)
    var prettypath = path.relative(path.dirname(module.parent.filename), output)

    // force-regen on startup, like when deployed
    fs.exists(output, function(exists) {
      // if (exists) return // run.js interacts strangely with browserify :|
      onBundle()
    })

    b.on('bundle', onBundle);
    function onBundle() {
      fs.writeFile(output, b.bundle(), 'utf8', onWrite);
    }
    function onWrite (err) {
      if (err) console.log(err.stack)
      console.log('Updated bundle -', b.modified.toISOString()
        , '-', prettypath)
    }
    b.on('syntaxError', function(err) {
      console.log(err.toString())
    })
  })
  return bundles;
}
