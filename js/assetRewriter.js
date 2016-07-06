module.exports = createRewriter

// polyfill
require('./lib/canvas-to-blob.min')

var ok = require('./ok')
var csscolors = require('./csscolors')
var recolor = require('./recolor')

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
    debug('change')
    var replacements = self.searchReplace.gatherReplacements()
    if (!replacements) return; // TODO tell user no replacements specified.

    var files = Array.prototype.slice.call(self.input[0].files, 0)
    files.forEach(function(file) {
      var r = new FileReader()

      // TODO: support zip files
      // https://github.com/gildas-lormeau/zip.js
      if (file.type.match('text.*')) {
        r.readAsText(file)
      } else if (file.type.match('image.*')) {
        // it is already a blob :)
        var blob = file
        var url = URL.createObjectURL(blob)
        debug('uploaded image', url)
        self.image(url, replacements, file.name, file.type)
      }

      r.onerror = console.log
      r.onload = function(e) {
        var result = e.target.result
        debug(file.type)

        if (file.type.match('text.*')) {
          var css = result
          return self.css(css, replacements, file.name + '')
        }
        // TODO: better error for user
        console.log('unrecognized mimetype')
      };
    })
  })
}

Rewriter.prototype.addLink = function addLink(blob, filename) {
  var self = this
  var link = self.downlink.clone().removeClass('hidden template')

  var url = URL.createObjectURL(blob)
  link.attr('href', url)
  // uses http://caniuse.com/#feat=download
  link.attr('download', filename) // keep same filename
  link.text('↓ download `' + filename + '`')
  link.show()
  self.downlink.parent().append(link)
  self.downlink.parent().append(' - or just ')
  self.downlink.parent().append(
    link.clone().removeAttr('download')
    .attr('target', '_blank')
    .text('view it')
  )
  self.downlink.parent().append($('<br>'))
};

Rewriter.prototype.css = function css(css, replacements, filename) {
  var self = this
  var newCSS = csscolors.findReplace(css, replacements)

  var blob = new Blob([ newCSS ], { type: 'text/css' })
  self.addLink(blob, filename)
};

// strat: load blob url into <img>, load that into a canvas, run recolor,
// convert canvas.toBlob(), make a link to the blob.
// TODO warn people when can't export desired mimetype.
Rewriter.prototype.image = function(bloburl, replacements, filename, mimetype) {
  var self = this
  var canvas = $('<canvas></canvas>')[0]
  var context = canvas.getContext('2d')

  var img = $('<img>').attr('src', bloburl).hide()
  $('body').append(img) // needs to be in dom so can access width and height
  img.load(function() {
    var w = img.width()
    var h = img.height()
    canvas.width = w
    canvas.height = h

    context.drawImage(img[0], 0, 0)
    debug(0, 0, w, h)
    debug('getImageData(0, 0, ', w, ', ', h)
    var oldImageData = context.getImageData(0, 0, w, h)
    img.remove() // no longer needed.

    var imageData = recolor(oldImageData, replacements)
    context.putImageData(imageData, 0, 0)

    canvas.toBlob(onblob, mimetype)
    function onblob (blob) {
      self.addLink(blob, filename)
    }
  })
};

function debug() {
  console.log.apply(console, arguments)
}
