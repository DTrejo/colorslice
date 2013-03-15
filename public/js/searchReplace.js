require('./lib/jquery-1.9.0.min.js')
var recolor = require('./recolor.js')
var str2colors = require('./str2colors')
var _ = require('./lib/underscore.js')
var a = require('assert')
a.print = true;
var deepEqual = require('deep-equal')
var identity = function (el) { return el }

module.exports = createSearchReplace

function createSearchReplace(container, canvas) {
  return new SearchReplace(container, canvas)
}

function SearchReplace(container, canvas) {
  var self = this
  self.container = $(container)
  self.canvas = $(canvas)

  // these are used to prevent recoloring if nothing will change.
  // holds the original image.
  self.original = null             // allows undo
  self.lastImageData = null        // detects changes to original image
  self.previousReplacements = null // detects changes to replacements

  var wait = 1000
  self.container
    .on('keyup blur',  '.c', _.debounce(doRecolor, wait))
    .on('keyup', '.range', _.debounce(doRecolor, wait))
  // jquery screws with the "this" context of the fn
  function doRecolor(e) {
    self.recolorImage(e)
  }
}

SearchReplace.prototype.recolorImage = function recolorImage (e) {
  var self = this
  // if a single replacement is invalid, and ignore update
  var replacements = self.gatherReplacements()

  // if there is no blank replacement div at the end of the list, add one
  if (null != replacements[replacements.length - 1]) {
    var template = self.container.find('.template').first()
    a.equal(template.length, 1)
    var clone = template.clone().removeClass('template').hide()
    clone.find('.ocolor, .ncolor').val('')
    clone.find('.range').val('0')
    self.container.find('ol').append(clone)
    clone.fadeIn()
  }
  replacements = replacements.filter(identity) // ignore "blank" ones

  var canvas = self.canvas[0]
  debug(canvas)
  var ctx = canvas.getContext('2d')
  curImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // if the canvas has a new image added to it, the original image is cleared
  // by the drag+drop code.
  // This also saves the original image to allow undo-ing.
  if (!self.original) {
    debug('original = curImage')
    self.original = curImage
  } else {
    // if all replacements and original are the same as last time, ignore update
    if (deepEqual(replacements, self.previousReplacements)) {
      // TODO: this never short-circuits b/c the are never deepequal :/
      debug('replacements are the same, original image has not changed')
      return
    }
  }
  self.previousReplacements = replacements

  debug('recolor', replacements)
  var newImage = recolor(curImage, replacements)
  ctx.putImageData(newImage, 0, 0, 0, 0, newImage.width, newImage.height)
  self.lastImageData = newImage
}

SearchReplace.prototype.gatherReplacements = function gatherReplacements() {
  var self = this
  var recolors = self.container.find('.recolor');
  a.ok(recolors.length > 0)
  return _.map(recolors, self.gatherReplacement)
}
SearchReplace.prototype.gatherReplacement = function gatherReplacement(el) {
  el = $(el)
  ocolorinput = el.children('.ocolor')
  a.equal(ocolorinput.length, 1)
  ncolorinput = el.children('.ncolor')
  a.equal(ncolorinput.length, 1)
  rangeinput = el.children('.range')
  a.equal(rangeinput.length, 1)

  // TODO warn the user when they've entered invalid stuff
  var ocolor = ocolorinput.val()
  var ncolor = ncolorinput.val()
  var range = parseFloat(rangeinput.val(), 10)
  try {
    a.ok(ocolor.length)
    a.ok(ncolor.length)

    ocolor = str2colors(ocolor)
    a.ok(ocolor)
    ocolor = ocolor.obj.hsl()

    ncolor = str2colors(ncolor)
    a.ok(ncolor)
    ncolor = ncolor.obj.hsl()

    a.ok(!isNaN(range))
    a.ok(range >= 0)
  } catch (e) {
    return null
  }

  return {
      ocolor: ocolor
    , ncolor: ncolor
    , top: range
    , bot: range
  }
}

function debug() {
  console.log.apply(console, arguments)
}
