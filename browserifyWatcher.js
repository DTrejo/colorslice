module.exports = browserifyWatcher

var path = require('path')
var fs = require('fs')
var browserify = require('browserify')

//
// Takes a path to a js file, outputs browserified version, e.g.
// dir/filename.js -> dir/filename.min.js
//
function browserifyWatcher (mainjs) {
  var b = browserify({ watch: true, debug: true })
  b.addEntry(mainjs)

  var newname = path.basename(mainjs, '.js') + '.min.js'
  var output = path.join(path.dirname(mainjs), newname)

  onBundle() // force-regen the first time, like when deployed

  b.on('bundle', onBundle);
  function onBundle() {
    fs.writeFile(output, b.bundle(), 'utf8', onWrite);
  }
  function onWrite () {
    console.log('Updated bundle -', b.modified.toISOString()
      , '-', path.relative(path.dirname(module.parent.filename), output))
  }
  return b;
}
