module.exports = createRack

require('./lib/jquery-1.9.0.min.js')
require('./lib/d3.v3.min.js')
var cancel = require('./cancel')
var bestContrastYIQ = require('./bestContrastYIQ')
// var kul = require('./kul')

// body and container are jquery selectors
function createRack(body, container) {
  return new Rack(body, container)
}

function Rack(body, container) {
  var self = this
  self.body = $(body)
  self.container = $(container)
  debug('self.body', self.body[0])
  debug('self.container', self.container[0])

  // TODO change this when theme is changed by user.
  self.previous_bg_color = self.body.css('background-color')
  debug('self.previous_bg_color', self.previous_bg_color)

  // attach handlers
  self.container
    .on('mouseenter', '.color', function(e) {
      return self.colorHoverIn(e) // wrapped b/c event-handlers have different this
    })
    .on('mouseleave', '.color', function(e) {
      return self.colorHoverOut(e)
    })

  // edit/update
  self.container.on('keyup', '.color .c', function(e) {
    var el = $(e.target)
    var slice = el.parent()
    var colors = kul(el.text()).all()
    debug('keyup .color .c', el[0], slice[0], colors)
    self.updateSlice(el, slice, colors)
  })

  // delete
  self.container.on('click', '.delete', function(e) {
    debug('click .delete')
    var slice = $(e.target).parent()
    self.deleteSlice(slice)
  })

  // to get the template to have the right color
  var input =
    self.container.find('.color.template .c').first()
  input.trigger('keyup')
  debug('.color.template .c:first', input[0])
}

Rack.prototype.addSlice = function addSlice(rgbarr) {
  var self = this
  debug('addSlice', rgbarr)
  // keeping the template there can be nice.
  // $('#colors .template').hide()

  var slice =
    $('#colors .template')
      .first().clone().removeClass('template')
      .hide()

  var colors = kul('rgb(' + rgbarr.join(', ') + ')').all()
  self.updateSlice(slice.children('.c'), slice, colors)

  self.container.prepend(slice)

  slice.slideDown('fast')
}

// need the el argument b/c don't want to upset or move their
// cursor with an el.text('...');
Rack.prototype.updateSlice = function updateSlice(el, slice, colors) {
  debug(el[0], '|', slice[0], '|', colors)
  // ignore invalid updates
  if (!colors) return

  el.siblings('.hex').text(colors.hex)
  el.siblings('.rgb').text(colors.rgb)
  el.siblings('.hsl').text(colors.hsl)
  el.siblings('.husl').text(colors.husl)
  slice
    .css('background-color', colors.rgb)
    .removeClass('black white')
    .addClass(bestContrastYIQ(colors.rgbarr))
  debug('updateSlice', slice[0])
}

Rack.prototype.deleteSlice = function deleteSlice(slice) {
  debug('deleteSlice', slice)
  slice.slideUp('fast', function() {
    // never remove the template
    if (slice.hasClass('template')) return
    slice.remove()
  })
}

Rack.prototype.colorHoverIn = function colorHoverIn(e) {
  debug('colorHoverIn', e.target)
  var self = this
  var slice = $(e.target)
  self.body.css('background-color', slice.css('background-color'))
}

Rack.prototype.colorHoverOut = function colorHoverOut(e) {
  debug('colorHoverOut', e.target)
  var self = this
  self.body.css('background-color', self.previous_bg_color)
}

Rack.prototype.addDivider = function addDivider() {
  var self = this
  self.container.prepend('<hr>')
}

function debug() {
  // console.log.apply(console, arguments)
}
