require('./lib/d3.v3.min.js')

module.exports = recolor

// takes a canvas image data, modifies it.
// takes an array of replacements. Only first match will be applied.
// replaces any hue near ocolor with the hue from ncolor
// top and bot are used to specify how much hue above and below ocolor
// should be changed
//
// usage:
//
//   var replacements = [{
//     ocolor: d3.hsl('rgb(252, 232, 173)'),
//     ncolor: d3.hsl('blue'),
//     top: 20,
//     bot: 50
//   }]
//   recolor(imageData, replacements);
//
// TODO: https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
function recolor (imageData, replacements) {
  var h = imageData.height
  var w = imageData.width
  console.log('recolor imageData h, w: ', h, w)
  // console.log('recolor ocolor ncolor ', ocolor, ncolor, typeof ocolor, typeof ncolor)
  // console.log(top, bot, typeof top, typeof bot)

  // convert top and bottom range to hues
  replacements = replacements.map(function(rep) {
    rep.tophue = (rep.ocolor.h + rep.top) % 360
    rep.bothue = (rep.ocolor.h - rep.bot) % 360
    return rep
  })

  var hsl = new d3.hsl(0,0,0)
  var rgb = new d3.rgb(0,0,0)
  var index = 0
  var r = 0, rep
  for (var y = 0; y < h; ++y) {
    for (var x = 0; x < w; ++x) {
      index = (y * w + x) * 4;
      rgb.r = imageData.data[index]
      rgb.g = imageData.data[index+1]
      rgb.b = imageData.data[index+2]
      // var alpha = imageData.data[index+3]

      hsl = d3.hsl(rgb)
      for (r = 0, len = replacements.length; r < len; r++) {
        rep = replacements[r]
        // TODO: do wrap-around math, b/c hue is 0-360 and wraps around
        if (rep.tophue >= hsl.h && hsl.h >= rep.bothue) {
          // TODO is hue linear
          // if something is -5 hue away from the searched hue, replace with
          // the new hue, but subtract 5 from the new hue.
          hsl.h = rep.ncolor.h + hsl.h - rep.ocolor.h
          // hsl.s = rep.ncolor.s + hsl.s - rep.ocolor.s
          // changing luminance doesn't make sense.
          // hsl.l = rep.ncolor.l + hsl.l - rep.ocolor.l
          rgb = hsl.rgb()

          imageData.data[index] = rgb.r
          imageData.data[index+1] = rgb.g
          imageData.data[index+2] = rgb.b
          // imageData.data[index+3] = alpha

          // only apply the first matched replacement for this pixel
          break
        }
      }
    }
  }
  return imageData
}

if (window.location.pathname === '/recolor.html') {
  require('./lib/jquery-1.9.0.min.js')

  $(function() {
    console.log('bound')
    $('a').first().click(onClick)
  })

  function onClick() {
    var image = $('img').first()[0]
    var canvas = $('canvas').first()[0]
    console.log(image, canvas)

    var iw = image.width
    var ih = image.height
    canvas.width = iw
    canvas.height = ih

    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)

    // This function cannot be called if the image is not from the same domain.
    // You'll get security error if you do.
    imageData = ctx.getImageData(0, 0, iw, ih)

    var replacements = [
    {
      ocolor: d3.hsl('rgb(252, 232, 173)'),
      ncolor: d3.hsl('green'),
      top: 20,
      bot: 20
    }
    ,
    {
      ocolor: d3.hsl('rgb(252, 232, 173)'),
      ncolor: d3.hsl('blue'),
      top: 50,
      bot: 50
    }
    ]
    console.log(replacements[0], replacements[1])
    ctx.putImageData(recolor(imageData, replacements), 0, 0, 0, 0
      , imageData.width, imageData.height)
    // var newurl = canvas.toDataURL()
    // $(image).attr('src', newurl)
  }
}
