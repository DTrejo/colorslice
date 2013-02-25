require('./lib/jquery-1.9.0.min.js')
require('./lib/d3.v3.min.js')
require('./cancel')

module.exports = recolor

// takes a canvas image data, modifies it.
// replaces instances of ocolor with ncolor.
function recolor (imageData, ocolor, ncolor) {
  // This loop gets every pixels on the image and
  console.log('h w', imageData.height, imageData.width)

  var h = imageData.height
  var w = imageData.width

  for (var y = 0; y < h; ++y) {
    for (var x = 0; x < w; ++x) {
        var index = (y * w + x) * 4;
        var red = imageData.data[index]
        var green = imageData.data[index+1]
        var blue = imageData.data[index+2]
        var alpha = imageData.data[index+3]
        var average = (red+green+blue)/3
        imageData.data[index] = average
        imageData.data[index+1] = average
        imageData.data[index+2] = average
        imageData.data[index+3] = alpha
    }
  }

  return imageData
}
if (!module.parent) {
  $(function() {
    console.log('bound')
    $('a').first().click(onClick)
  })
}

function onClick() {
  var image = $('img').first()[0]
  var canvas = $('canvas').first()[0]
  console.log(image, canvas);

  var iw = image.width
  var ih = image.height
  // You'll get some string error if you fail to specify the dimensions
  canvas.width = iw
  canvas.height = ih
  console.log(iw, ih);
  var ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)

  // This function cannot be called if the image is not rom the same domain.
  // You'll get security error if you do.
  imageData = ctx.getImageData(0, 0, iw, ih)

  ctx.putImageData(recolor(imageData), 0, 0, 0, 0
    , imageData.width, imageData.height)
  var newurl = canvas.toDataURL();
  $(image).attr('src', newurl)
}
