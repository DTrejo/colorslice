module.exports = createKul

require('./lib/d3.v3.min.js')
// exposes extractValues
require('extract-values')

function createKul(text) {
  return new Kul(text)
}

//
// goals
// remember original format, convert to all formats, remember alpha
//
function Kul(text) {
  text = text.trim()
  if (!text) return
  var self = this

  // CSS colors do not need whitespace in them.
  text = text.replace(/ /g, '')
  debug('Kul', text)

  self.alpha = 1 // allows conversion to alpha formats without problems

  var opts = { lowercase: true }
  if (first(text, 'rgba')) {
    var vals = extractValues(text, 'rgba({r},{g},{b},{a})', opts)
    debug('rgba vals', vals)
    self.alpha = parseFloat(vals.a, 10)
    self.rgbobj = d3.rgb(vals.r, vals.g, vals.b)
    self.toString = self.rgba
    return
  }

  if (first(text, 'hsla')) {
    var vals = extractValues(text, 'hsla({h},{s},{l},{a})', opts)
    vals.s = vals.s.replace(/%/g, '')
    vals.l = vals.l.replace(/%/g, '')
    debug('hsla vals', vals)
    self.alpha = parseFloat(vals.a, 10)
    var hsl = d3.hsl(vals.h, parseFloat(vals.s)/100, parseFloat(vals.l)/100)
    self.rgbobj = hsl.rgb()
    self.toString = self.hsla
    return
  }

  // handle:
  // word color, hex, rgb, hsl
  try {
    self.rgbobj = d3.rgb(text)
  } catch (e) {
    console.log('kul: could not parse', text)
    return
  }

  // convert to the input format
  if (first(text, 'hsl')) self.toString = self.hsl
  else if (first(text, 'rgb')) self.toString = self.rgb
  else if (first(text, '#')) self.toString = self.hex
  else {
    // in this case, it is a word, so fallback to d3's toString
    self.toString = (function fallback (rgb) {
      return (rgb || self.rgbobj).toString()
    })
  }
}

Kul.prototype.rgba = function rgba(rgb) {
  var self = this
  var rgb = rgb || self.rgbobj
  return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + self.alpha + ')'
}
Kul.prototype.rgb = function rgb(rgb) {
  var self = this
  var rgb = rgb || self.rgbobj
  return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')'
}

Kul.prototype.hsla = function hsla(rgb) {
  var self = this
  var rgb = rgb || self.rgbobj
  var hsl = rgb.hsl()
  debug('hslaing', hsl)
  return 'hsla('
    + [ precision(hsl.h, 2), toPercent(hsl.s), toPercent(hsl.l), self.alpha ]
      .join(', ')
    + ')'
}
Kul.prototype.hsl = function hsl(rgb) {
  var self = this
  var rgb = rgb || self.rgbobj
  var hsl = rgb.hsl()
  return 'hsl('
    + [ precision(hsl.h, 2), toPercent(hsl.s), toPercent(hsl.l) ].join(', ')
    + ')'
}

Kul.prototype.hex = function hex(rgb) {
  var self = this
  return (rgb || self.rgbobj) + ''
}

Kul.prototype.rgbarr = function rgbarr(rgb) {
  var self = this
  var rgb = rgb || self.rgbobj
  return [ rgb.r, rgb.g, rgb.b ]
}

Kul.prototype.all = function all() {
  var self = this
  return {
    hex: self.hex()
    , rgb: self.rgb()
    , rgbarr: self.rgbarr()
    , hsl: self.hsl()
    , obj: self.rgbobj
  }
}

function first(text, start) {
  return text.indexOf(start) === 0
}

function toPercent(num) {
  return precision(num * 100, 2) + '%'
}

function precision(num, decimals) {
  var factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

// if (!module.parent) test()
window.kul = createKul

if (window.location.hostname === 'localhost') test()

function test() {
  var a = require('assert')
  var eq = a.deepEqual
  var kul = createKul
  var result =
    { "hex":"#046284"
    , "rgb":"rgb(4, 98, 132)"
    , "rgb":"rgb(4, 98, 132)"
    , "rgbarr":[4,98,132]
    , "hsl":"hsl(195.94, 94.12%, 26.67%)"
    , "obj":{"r":4,"g":98,"b":132}
    }

  // lets not break old functionality
  eq(kul('#046284').all(), result)
  eq(kul('rgb(4, 98, 132)').all(), result)
  eq(kul('hsl(195.94, 94.12%, 26.67%)').all(), result)


  // // support pass-through of alpha value, if supplied.
  eq(kul('rgba(4, 98, 132, 0.5)')+'', 'rgba(4, 98, 132, 0.5)')
  eq(kul('hsla(195.94, 94.12%, 26.67%, 0.9)') + ''
    , 'hsla(195.94, 94.12%, 26.67%, 0.9)')

  // toss alpha
  eq(kul('rgba(4, 98, 132, 0.5)').rgb(), 'rgb(4, 98, 132)')

  // insert alpha
  eq(kul('rgb(4, 98, 132)').rgba(), 'rgba(4, 98, 132, 1)')

  // whitespace
  eq(kul('rgba(4,98, 132,  .1)').rgba(), 'rgba(4, 98, 132, 0.1)')
  eq(kul('hsla(195.94  , 94.12%,   26.67%, 0.  9)') + ''
    , 'hsla(195.94, 94.12%, 26.67%, 0.9)')

  // hsl without percent signs


  // words
  eq(kul('red') + '', '#ff0000')

  // can reuse functions on `kul` to render from one color format to another,
  // programmatically
  var rgbobj = d3.rgb('rgb(0,0,0)')
  eq(kul('#f00f00').toString(rgbobj), '#000000')
  eq(kul('hsl(1,1%,1%)').toString(rgbobj), 'hsl(0, 0%, 0%)')
}

function debug() {
  // console.log.apply(console, arguments)
};