require('./lib/jquery-1.9.0.min.js')
var colorscheme = require('./colorscheme')
var a = require('assert')

module.exports = createSchemer

function createSchemer (container, canvas, rack) {
  return new Schemer(container, canvas, rack)
}

function Schemer (container, canvas, rack) {
  var self = this

  self.container = $(container)
  self.canvas = $(canvas).first()[0]
  self.rack = rack

  self.button = self.container.find('button').first()
  self.input = self.container.find('input').first()
  self.last = self.container.find('.lastscheme')

  a.ok(self.container[0])
  a.ok(self.canvas)
  a.ok(self.button[0])
  a.ok(self.input[0])
  a.ok(self.rack)
  a.ok(self.last)

  self.button.on('click', function() {
    var text = self.input.val().trim();
    if (!text) return
    var numcolors = parseInt(text, 10)
    if (isNaN(numcolors) || numcolors <= 0) return

    self.rack.addDivider()
    var colors = colorscheme(self.canvas, numcolors)
    debug(colors)
    colors.forEach(function(color) {
      var c = color.rgb()
      var rgbarr = [ c.r, c.g, c.b ]
      self.rack.addSlice(rgbarr)
    })
    self.rack.addDivider()

    self.last.empty()
    colors.forEach(function(c) {
      var el = $('<span>' + c.rgb() + '</span>')
        .css({
          'backgroundColor': c.rgb()
        , 'color': c.rgb() // hides the color until selected ;)
        , 'height': 100
        , 'width': 100
        , 'display': 'inline-block'
        })
      self.last.append(el)
    })
  })
}

function debug() {
  // console.log.apply(console, arguments)
};