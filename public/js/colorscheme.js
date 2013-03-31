var ycbcr = require('./ycbcr')
var _ = require('./lib/underscore.js')
var assert = require('assert')

module.exports = scheme

// 0..255, 0..255, 0.255
function getBucket(y, cb, cr) {
  return Math.floor(y/256 * 10) * 10 * 10 +
         Math.floor(cb/256 * 10) * 10 +
         Math.floor(cr/256 * 10)
}

function scheme (canvas, numbuckets) {
  var TOTAL_BUCKETS = 1000
  numbuckets = Math.min(numbuckets, TOTAL_BUCKETS)
  var ctx = canvas.getContext('2d')
  var w = canvas.width
  var h = canvas.height
  debug('w, h', w, h)
  var imageData = ctx.getImageData(0, 0, w, h)
  var data = imageData.data
  var buckets = _.range(0, TOTAL_BUCKETS).map(function() { return [] })

  var r, g, b, color = ycbcr(0, 0, 0), hash = ''
  var x = 0, y = 0, index = 0
  for (y = 0; y < h; ++y) {
    for (x = 0; x < w; ++x) {
      index = (y * w + x) * 4;
      r = data[index]
      g = data[index + 1]
      b = data[index + 2]
      color = ycbcr(r, g, b)

      var b = getBucket(color.y, color.cb, color.cr);
      buckets[b].push(color)
    }
  }

  buckets.sort(function(a, b) {
    return b.length - a.length
  });

  var scheme =
    buckets.slice(0, numbuckets)
      .filter(function(b) { return b.length })
      .map(function(b) {
      var sy = scb = scr = 0;
      var len = b.length
      for (var i = 0; i < len; i++) {
        sy += b[i].y
        scb += b[i].cb
        scr += b[i].cr
      }
      var color = ycbcr(0,0,0)
      color.y = sy / len
      color.cb = scb / len
      color.cr = scr / len
      assert.ok(!isNaN(color.y))
      assert.ok(!isNaN(color.cb))
      assert.ok(!isNaN(color.cr))
      return color
    })
  debug(scheme)
  // darkest on the left
  return scheme.sort(function(a, b) {
    return a.y - b.y
  });
}

if (window.location.pathname === '/scheme.html') {
  require('./lib/jquery-1.9.0.min.js')

  $(function() {
    $('img').first().load(go)
  })
  function go() {
    var image = $('img').first()[0]
    var canvas = $('canvas').first()[0]
    console.log(image, canvas)

    var iw = image.width
    var ih = image.height
    canvas.width = iw
    canvas.height = ih

    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)

    var colors = scheme(canvas, 6)
    console.log(colors)

    colors.forEach(function(c) {
      var el = $('<span>&nbsp;</span>')
        .css({
          'backgroundColor': c.rgb().toString()
        , 'height': 100
        , 'width': 100
        , 'display': 'inline-block'
        })
      $('body').append(el)
    })
  }
}

function debug() {
  // console.log.apply(console, arguments)
}
