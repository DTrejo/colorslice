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
  var HUSL = require('husl')

  $('img').first().load(go)
  $(function() {
    $('img').first().load(go)
  })
  var gone = false
  function go() {
    if (gone) return
    gone = true

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

    // var colors = [
    //   ycbcr(10, 12, 17), // rgb(10, 12, 17)
    //   ycbcr(74, 59, 51), // rgb(74, 59, 51)
    //   ycbcr(109, 50, 37), // rgb(109, 50, 37)
    //   ycbcr(53, 75, 120), // rgb(53, 75, 120)
    //   ycbcr(130, 177, 236), // rgb(130, 177, 236)
    // ]
    var arr = '#0a0c11 #98c7f8 #b0c1da #c0dff8 #e2f5fc'.split(' ')
    var arr = '#120a06 #332216 #7793b4 #96a9bd #b3bac1 #cec0af'.split(' ')
    var arr = '#012164 #433944 #2e6395 #9e6929 #c1a46b'.split(' ')
    var arr = '#182d39 #790e07 #286183 #c8513f #eba896'.split(' ')
    var arr = '#222620 #455e65 #a07204 #cfa42c #e8f6fa'.split(' ')
    var arr = '#c3c3cd #e4e512 #ebd423 #b1e0d0 #046284'.split(' ')
    var arr = '#232128 #6c7286 #84b9cb #e5e610 #e1ded5'.split(' ')
    var arr = '#142b40 #265076 #894853 #958395 #fdc6ab'.split(' ')
    var arr = '#2e34aa #3056da #8a409c #8d6fe4 #9d90ec'.split(' ')
    var arr = '#2d261a #33424a #7e909c #d59a68 #f4ebea'.split(' ')
    var arr = '#0d2d3f #5a131f #09738b #4c9ab8 #90aab6'.split(' ')
    var arr = '#10120e #423943 #786c78 #ca8060 #dcb889'.split(' ')
    var arr = '#070a08 #433848 #5876a6 #82b1ec #dad3da'.split(' ')
    var arr = '#ecd5c8 #c7eafc #40507d #5b4f4c #d11b30'.split(' ')
    var arr = '#051021 #901a13 #cc5232 #73cdf3 #fdf3ae'.split(' ')

    var colors = [
      hex2ycbcr(arr[0]),
      hex2ycbcr(arr[1]),
      // hex2ycbcr('#786b7e'),
      hex2ycbcr(arr[2]),
      // hex2ycbcr('#98c7f8'),
      hex2ycbcr(arr[3]),
      hex2ycbcr(arr[4])
    ]

    colors.forEach(function(c) {
      $('body').append(color_square(c.rgb().toString()))
    })
    $('body').append('<br><br>')

    var table = $('<table></table>')

    colors.forEach(function(c, i) {
      var tr = $('<tr></tr>')

      // var siblings = colors.slice(0, i).concat(colors.slice(i, colors.length))

      // 1
      var td = $('<td></td>')
      td.append(color_square(setL(colors[0], c)))
      tr.append(td)

      // 2
      var td = $('<td></td>')
      td.append(color_square(setL(colors[1], c)))
      tr.append(td)

      // 3
      var td = $('<td></td>')
      td.append(color_square(setL(colors[2], c)))
      tr.append(td)

      // 4
      var td = $('<td></td>')
      td.append(color_square(setL(colors[3], c)))
      tr.append(td)

      // 5
      var td = $('<td></td>')
      td.append(color_square(setL(colors[4], c)))
      tr.append(td)

      table.append(tr)
    })
    $('body').append(table)

    function color_square(hex) {
      return $('<span>' + hex + '<br> husl(x,x,' + HUSL.fromHex(hex)[2].toFixed(2) + ')</span>')
        .css({
          'backgroundColor': hex
        , 'color': hex
        , 'height': 100
        , 'width': 100
        , 'display': 'inline-block'
        })
    }
    function setL(c, scale) {
      // sets lightness of a d3 color to a multiple of it's HUSL lightness
      var husl = HUSL.fromHex(c.rgb().toString())

      // var distance = Math.min(100 - husl[2], husl[2])
      // husl[2] += (distance * scale)

      husl[2] += 100 * scale
      if (husl[2] > 100 || husl[2] < 0) return '#ffffff' // ignore it if it if out of range

      var c2 = d3.rgb(HUSL.toHex(husl[0], husl[1], husl[2]))
      // debug('c', c, scale, '-->', c2, c2.toString())
      return c2.toString()
    };
    function setL(c, c2) {
      // use the luminance of the c2 in c
      var husl = HUSL.fromHex(c.rgb().toString())
      var husl2 = HUSL.fromHex(c2.rgb().toString())
      var c3 = d3.rgb(HUSL.toHex(husl[0], husl[1], husl2[2]))
      return c3.toString()
    }
    function hex2ycbcr(hex) {
      var rgb = d3.rgb(hex)
      return ycbcr(rgb.r, rgb.g, rgb.b)
    };
  }
}

function debug() {
  // console.log.apply(console, arguments)
}
