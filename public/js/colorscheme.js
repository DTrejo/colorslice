var ycbcr = require('./ycbcr')
var _ = require('./lib/underscore.js')

module.exports = scheme

function scheme (canvas, numbuckets) {
  var ctx = canvas.getContext('2d')
  var w = canvas.width
  var h = canvas.height
  console.log('w, h', w, h)
  var imageData = ctx.getImageData(0, 0, w, h)
  var data = imageData.data
  var buckets = _.range(numbuckets).map(function() {
    return {}
  })

  // 0 1 2 3 4 5
  var ranges = []
  for (var i = 0; i <= numbuckets; i++) {
    ranges.push(i * 100/numbuckets)
  }

  // console.log('ranges', ranges)

  var r, g, b, color = ycbcr(0, 0, 0), hash = ''
  var x = 0, y = 0
  for (y = 0; y < w; ++y) {
    for (x = 0; x < h; ++x) {
      index = (y * w + x) * 4;
      r = data[index]
      g = data[index + 1]
      b = data[index + 2]
      color = ycbcr(r, g, b)

      for (b = 0; b < numbuckets; b++) {
        // console.log('examine', color.y, 'inside', ranges[b], ranges[b + 1], '?')
        if (ranges[b] <= color.y && color.y <= ranges[b + 1]) {
          // console.log('bang!')
          hash = color.toString()
          buckets[b][hash] = (buckets[b][hash] || 0) + 1
        }
      }
    }
    // console.log(buckets)
    // return // TODO remove
  }

  var scheme = []
  buckets.forEach(function(hist) {
    var keys = _.keys(hist)
    var average = [0, 0, 0] // y, cb, cr
    var numcolors = 0 // how many colors total are in the bucket.

    var i = 0, key = '', color = ''
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i]
      color = key.split(',')
      average[0] += parseFloat(color[0], 10) * hist[key]
      average[1] += parseFloat(color[1], 10) * hist[key]
      average[2] += parseFloat(color[2], 10) * hist[key]
      numcolors += hist[key]
    }
    average[0] /= numcolors
    average[1] /= numcolors
    average[2] /= numcolors

    console.log(average)

    var ycolor = ycbcr(0,0,0)
    ycolor.y = average[0]
    ycolor.cb = average[1]
    ycolor.cr = average[2]

    scheme.push(ycolor)
  })
  return scheme
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
