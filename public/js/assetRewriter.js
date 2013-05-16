module.exports = createRewriter
var ok = require('./ok')
var csscolors = require('./csscolors')

//
// takes a search replaceWidget, allows user to drop/import
// assets to be rewritten client-side.
//
function createRewriter(container, searchReplace) {
  return new Rewriter(container, searchReplace)
}

function Rewriter(container, searchReplace) {
  var self = this
  self.container = ok($(container).first())
  self.searchReplace = ok(searchReplace)

  self.input = ok(self.container.find('input'))
  self.downlink = ok(self.container.find('a'))

  self.input.change(function(e) {
    // console.log('change')
    var replacements = self.searchReplace.gatherReplacements()
    if (!replacements) return; // TODO tell user no replacements specified.

    self.downlink.hide()

    for (var i = 0; i < self.input[0].files.length; i++) {
      var file = self.input[0].files[i]
      var r = new FileReader()


      // TODO: support images and zip files.
      // https://github.com/gildas-lormeau/zip.js
      r.readAsText(file)
      r.onerror = console.log
      r.onload = function(e) {
        var css = e.target.result
        // console.log(file.type)
        if (!file.type.match('text.*')) return // TODO give user an error

        var newCSS = csscolors.findReplace(css, replacements)

        var blob = new Blob([ newCSS ], { type: 'text/css' })
        var url = URL.createObjectURL(blob)
        self.downlink.attr('href', url)
        self.downlink.attr('download', file.name) // keep same filename
        self.downlink.show()
        // downlink uses http://caniuse.com/#feat=download
      };
    }
  })
}