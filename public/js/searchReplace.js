require('./lib/jquery-1.9.0.min.js')
var recolor = require('./recolor.js')
var kul = require('./kul')
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

  self.container.find('button.add').on('click', function(e) {
    self.addSR()
  });
  self.container.on('click', '.delete', function(e) {
    var el = $(e.target).parent()
    if (el.hasClass('template')) return self.blankify(el.hide())
    el.slideUp(100, function() {
      el.remove()
    })
  });
  self.container.find('button.apply').on('click', function() {
    self.recolorImage()
  });
}

SearchReplace.prototype.recolorImage = function recolorImage (e) {
  var self = this

  var replacements = self.gatherReplacements()
  // if a single replacement is invalid or blank, and ignore it
  replacements = replacements.filter(identity)

  var canvas = self.canvas[0]
  debug(canvas)
  var ctx = canvas.getContext('2d')
  curImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

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

    ocolor = kul(ocolor).all()
    a.ok(ocolor)
    ocolor = ocolor.obj.hsl()

    ncolor = kul(ncolor).all()
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

SearchReplace.prototype.addSR = function addSR () {
  var self = this
  var template = self.container.find('.template').first()
  a.equal(template.length, 1)
  var clone = template.clone().removeClass('template').hide()
  self.blankify(clone)
  self.container.find('ol').append(clone)
  clone.slideDown(100)
}

// won't show up in the replacements list, b/c blank
SearchReplace.prototype.blankify = function blankify (el) {
  el.find('.ocolor, .ncolor').val('')
  el.find('.range').val('0')
  return true
}

function debug() {
  // console.log.apply(console, arguments)
}
