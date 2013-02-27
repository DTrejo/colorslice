require('./lib/d3.v3.min.js')

module.exports = recolor

// takes a canvas image data, modifies it.
// replaces any hue near ocolor with the hue from ncolor
// top and bot are used to specify how much hue above and below ocolor should also be changed
//
// usage:
//   recolor(imageData, d3.hsl('#3a5898'), d3.hsl('red')
//
// TODO: https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
function recolor (imageData, ocolor, ncolor, top, bot) {
  var h = imageData.height
  var w = imageData.width
  console.log('recolor imageData h, w: ', h, w)
  // console.log('recolor ocolor ncolor ', ocolor, ncolor, typeof ocolor, typeof ncolor)
  // console.log(top, bot, typeof top, typeof bot)

  var top = ocolor.h + top
  var bot = ocolor.h - bot

  var hsl = new d3.hsl(0,0,0)
  var rgb = new d3.rgb(0,0,0)
  var index = 0
  for (var y = 0; y < h; ++y) {
    for (var x = 0; x < w; ++x) {
      index = (y * w + x) * 4;
      rgb.r = imageData.data[index]
      rgb.g = imageData.data[index+1]
      rgb.b = imageData.data[index+2]
      // var alpha = imageData.data[index+3]

      hsl = d3.hsl(rgb)
      if ( top >= hsl.h && hsl.h >= bot) {
        // TODO is hue linear
        // if something is -5 hue away from the searched hue, replace with
        // the new hue, but subtract 5 from the new hue.
        hsl.h = ncolor.h + hsl.h - ocolor.h
        rgb = hsl.rgb()

        imageData.data[index] = rgb.r
        imageData.data[index+1] = rgb.g
        imageData.data[index+2] = rgb.b
        // imageData.data[index+3] = alpha
      }
    }
  }
  return imageData
}

// see /recolor.html
if (!module.parent) {
  require('./lib/jquery-1.9.0.min.js')

  $(function() {
    console.log('bound')
    $('a').first().click(onClick)
  })

  function onClick() {
    var image = $('img').first()[0]
    var canvas = $('canvas').first()[0]
    console.log(image, canvas);

    var iw = image.width
    var ih = image.height
    canvas.width = iw
    canvas.height = ih

    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)

    // This function cannot be called if the image is not from the same domain.
    // You'll get security error if you do.
    imageData = ctx.getImageData(0, 0, iw, ih)

    ctx.putImageData(recolor(imageData, d3.hsl('rgb(252, 232, 173)'), d3.hsl('blue'), 20, 50), 0, 0, 0, 0
      , imageData.width, imageData.height)
    // var newurl = canvas.toDataURL();
    // $(image).attr('src', newurl)
  }
}
