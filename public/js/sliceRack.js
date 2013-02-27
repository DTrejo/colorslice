module.exports = createRack

require('./lib/jquery-1.9.0.min.js')
require('./lib/d3.v3.min.js')
var _ = require('./lib/underscore.js')
var cancel = require('./cancel')
var bestContrastYIQ = require('./bestContrastYIQ')
var str2colors = require('./str2colors')
var recolor = require('./recolor')

// body and container are jquery selectors
function createRack(body, container) {
  return new Rack(body, container)
}

function Rack(body, container) {
  var self = this
  self.body = $(body)
  self.container = $(container)

  // TODO change this when theme is changed by user.
  self.previous_bg_color = self.body.css('background-color')

  // attach handlers
  self.container
    .on('mouseenter', '.color', function(e) {
      return self.colorHoverIn(e) // wrapped b/c event-handlers have different this
    })
    .on('mouseleave', '.color', function(e) {
      return self.colorHoverOut(e)
    })

  // edit/update
  self.container.on('keyup', '.color .formats [contenteditable]', function(e) {
    var el = $(e.target)
    var slice = el.parent().parent()
    var colors = str2colors(el.text().trim())
    self.updateSlice(el, slice, colors)
  })

  // delete
  self.container.on('click', '.delete', function(e) {
    var slice = $(e.target).parent().parent()
    return self.deleteSlice(slice)
  })

  // to get the template to have the right color
  var input =
    self.container.find('.color.template .formats span')
  input.trigger('keyup')

  //
  // recolor related
  //
  var wait = 1000
  self.container
    .on('keyup blur',  '.color .recolor .ncolor', _.debounce(self.recolorImage, wait))
    .on('keyup', '.color .recolor .top', _.debounce(self.recolorImage, wait))
    .on('keyup', '.color .recolor .bot', _.debounce(self.recolorImage, wait))
}

// ocolor is the color of the current swatch.
// ocolor will be swapped out for ncolor
var last = '' // so we don't recalc the same image, and slow stuff down.
var lastImageData
var original
Rack.prototype.recolorImage = function recolorImage (e) {
  var self = this
  console.log('attempt recolorImage')
  var recolordiv = $(e.target).parent()
  var top = parseInt(recolordiv.children('.top').text(), 10);
  var bot = parseInt(recolordiv.children('.bot').text(), 10);
  if (top < 0 || bot < 0
    || isNaN(top) || isNaN(bot)) {
    console.log('invalid top or bottom range:', top, bot)
    return
  }

  var el = recolordiv.parent().find('.hex')
  var ocolor = d3.hsl(el.text())
  el = recolordiv.children('.ncolor')
  var ncolor = d3.hsl(el.text())
  if (!ocolor || !ncolor) {
    console.log('invalid original or new color:', ocolor, ncolor)
    return
  }

  var canvas = $('#screen')[0]
  console.log(canvas)
  var ctx = canvas.getContext('2d')
  curImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

  var hash = [ocolor, ncolor, top, bot].join('')
  if (last === hash && lastImageData === curImage) {
    console.log('no change needed')
    return
  }
  last = hash
  lastImageData = curImage

  console.log('recolor', ocolor, ncolor, top, bot)
  var newImage = recolor(curImage, ocolor, ncolor, top, bot)
  ctx.putImageData(newImage, 0, 0, 0, 0, newImage.width, newImage.height)
};

Rack.prototype.addSlice = function addSlice(rgbarr) {
  var self = this
  // keeping the template there can be nice.
  // $('#colors .template').hide()

  var slice =
    $('#colors .template')
      .first().clone().removeClass('template')
      .hide()

  var colors = str2colors('rgb(' + rgbarr.join(', ') + ')')
  self.updateSlice(slice.children().children('span'), slice, colors)

  self.container.prepend(slice)

  slice.slideDown('fast')
}

// need the el argument b/c don't want to upset or move their
// cursor with an el.text('...');
Rack.prototype.updateSlice = function updateSlice(el, slice, colors) {
  // ignore invalid updates
  if (!colors) return

  el.siblings('.hex').text(colors.hex)
  el.siblings('.rgb').text(colors.rgb)
  el.siblings('.hsl').text(colors.hsl)
  slice
    .css('background-color', colors.rgb)
    .removeClass('black white')
    .addClass(bestContrastYIQ(colors.rgbarr))
}

Rack.prototype.deleteSlice = function deleteSlice(slice) {
  slice.slideUp('fast', function() {
    // never remove the template
    if (slice.hasClass('template')) return
    slice.remove()
  })
  return cancel(e)
}

Rack.prototype.colorHoverIn = function colorHoverIn(e) {
  var self = this
  var slice = $(e.target)
  self.body.css('background-color', slice.css('background-color'))
}

Rack.prototype.colorHoverOut = function colorHoverOut(e) {
  var self = this
  self.body.css('background-color', self.previous_bg_color)
}