var started = false;
var canvas;
var context;
var zoom;
var zoomcontext;
var swatch;
var swatchcontext;
var current;
var mouse = { x: 0
            , y: 0
            };
var image;
var previous_bg_color; // TODO change this when theme is changed by user.
$(document).ready(function() {
  $canvas = $('#screen');
  canvas = $canvas.get(0);
  context = canvas.getContext('2d');

  $canvas.mousemove(mousemove);
  $canvas.mousedown(mousedown);
  $canvas.mouseup(mouseup);
  $canvas.bind('dragover', cancel);
  $canvas.bind('dragenter', cancel);
  $canvas.bind('dragleave', cancel);
  canvas.addEventListener('drop', drop, false);
  zoom = $('#zoom').get(0);
  zoomcontext = zoom.getContext('2d');
  swatch = $('#swatch').get(0);
  swatchcontext = swatch.getContext('2d');
  current = $('#current');

  previous_bg_color = $('body').css('background-color')
  $('#colors')
    .on('mouseenter', '.color', colorHoverIn)
    .on('mouseleave', '.color', colorHoverOut)

  $('.color').on('click', '.delete', function(e) {
    var slice = $(e.target).parent()

    slice.slideUp('fast', function() {
      if (!slice.hasClass('template')) {
        slice.remove()
      }
    })
    e.preventDefault()
    return false;
  })
  $('#colors').on('keyup', '.color span[contenteditable]', function(e) {
    var el = $(e.target)
    var slice = el.parent()
    var colors = multiconvert(el.text().trim())
    updateSlice(el, slice, colors)
  })
  setTimeout(resize, 1000)
});

// otherwise mouse coordinates are not accurate.
// $(window).resize(resize);
function resize() {
  console.log('bang')
  $('canvas').each(function(i, el) {
    var s = getComputedStyle(el)
    var h = s.height
    var w = s.width
    console.log(el.width, el.offsetWidth, w, el)
    console.log(el.height, el.offsetHeight, h, el)
    el.width = parseInt(w, 10)
    el.height = parseInt(h, 10)
  })
}

// need the el argument b/c don't want to upset their
// cursor with an el.text('...');
function updateSlice(el, slice, colors) {
  // ignore invalid updates
  if (!colors) return

  el.siblings('.hex').text(colors.hex)
  el.siblings('.rgb').text(colors.rgb)
  el.siblings('.hsl').text(colors.hsl)
  slice
    .css('background-color', colors.rgb)
    .removeClass('black white')
    .addClass(getContrastYIQ(colors.rgbarr))
}

function colorHoverIn(e) {
  var body = $('body')
  var slice = $(e.target)
  var siblings = slice.siblings();

  body.css('background-color', slice.css('background-color'))

  siblings.css('border-top', slice.css('background-color'))
  siblings.css('border-bottom', slice.css('background-color'))
}
function colorHoverOut(e) {
  var body = $('body')
  var slice = $(e.target)
  var slices = $('.color')
  body.css('background-color', previous_bg_color)
}

function mousemove(event) {
  // Get the mouse position relative to the canvas element.
  mouse = crossBrowserRelativeMousePos(event);

  if (image) {
    var w = 20;
    var h = 20;
    var imageData =
      context.getImageData( mouse.x - (w / 2)
                          , mouse.y - (h / 2)
                          , w
                          , h);
    var newCanvas = $('<canvas>')[0];
    newCanvas.width = imageData.width;
    newCanvas.height = imageData.height;
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    zoomcontext.fillStyle = "#000";
    zoomcontext.fillRect(0, 0, zoom.width, zoom.height);
    zoomcontext.drawImage(newCanvas, 0, 0, zoom.width, zoom.height);
    // now highlight the current pixel.
    zoomcontext.fillStyle = "rgba(0, 0, 0, 0.5)";
    zoomcontext.strokeRect(zoom.width / 2 - 1, zoom.width / 2 - 1, 6, 6);

    // now draw current pixel really big in a sidebox
    imageData =
      zoomcontext.getImageData( zoom.width / 2
                              , zoom.height / 2
                              , 1
                              , 1);
    newCanvas = $('<canvas>')[0];
    newCanvas.width = imageData.width;
    newCanvas.height = imageData.height;
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    swatchcontext.fillStyle = "#000";
    swatchcontext.fillRect(0, 0, swatch.width, swatch.height);
    swatchcontext.drawImage(newCanvas, 0, 0, swatch.width, swatch.height);

    // also put the color into the #current paragraph
    var d = swatchcontext.getImageData(0, 0, 4, 4).data;
    var rgbarr = [ d[0], d[1], d[2], d[3] ];
    var colors = multiconvert('rgb(' + rgbarr.join(', ') + ')');
    current.text([ colors.hex, colors.rgb, colors.hsl ].join('\n'));
  }
  // testing
  // if (!started) {
  //   context.lineJoin = 'round';
  //   context.beginPath();
  //   context.moveTo(mouse.x, mouse.y);
  //   started = true;
  // } else {
  //   context.lineTo(mouse.x, mouse.y);
  //   context.stroke();
  // }
}

function mousedown(event) {
  return cancel(event);
}

function mouseup(event) {
  $('#colors .template').hide();

  // capture pixel, display it.
  var d = swatchcontext.getImageData(0, 0, 4, 4).data;
  var colors = [ d[0], d[1], d[2], d[3] ];
  var rgbarr = [ d[0], d[1], d[2] ];
  // var miniswatch = $('<img>')
  //   .attr('src', swatch.toDataURL('image/png'))
  //   .attr('width', 16)
  //   .attr('height', 16);

  var css = humanizeColor(colors);
  var slice = $('#colors .template').first().clone().removeClass('template')
    // .text(css.text)
    .hide()
    // .prepend(miniswatch)

  // so hackky lol
  updateSlice(slice.children('span'), slice, multiconvert('rgb(' + rgbarr.join(', ') + ')'));

  // var contrast = getContrastYIQ(colors);
  // console.log('adding', colors, contrast);
  // slice.addClass(contrast);

  // slice.css('background-color', css.rgba);

  $('#colors').prepend(slice);

  slice.slideDown('fast');
  // console.log(para);
}

function drop(event) {
  var file = event.dataTransfer.files[0]
  var reader = new FileReader()
  console.log(file)

  reader.onload = function (event) {
    image = document.createElement('img')
    image.onload = function () {
      var self = this;
      var ratio;

      // cases
      // image dimensions smaller than the canvas
      // - stretch the image to the canvas
      // image dimensions bigger than the canvas
      // - shrink the image to the canvas
      //
      // always maintain aspect ratio of the image.
      // determine the amount of stretching by choosing the longest side,
      // and scaling the image to fit snugly into the canvas based on this.
      var ratio;
      if (self.width > self.height) {
        ratio = canvas.width / self.width
      } else {
        ratio = canvas.height / self.height
      }
      // TODO fails when divides by 0
      context.drawImage( self, 0, 0
                       , self.width * ratio
                       , self.height * ratio)
    };

    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
  return cancel(event);
}

function cancel(event) {
  if (event.preventDefault) event.preventDefault();
  return false;
}


// MIT license, ©2010 Evan Wallace madebyevan.com
function crossBrowserElementPos(e) {
	e = e || window.event;
	var obj = e.target || e.srcElement;
	var x = 0, y = 0;
	while (obj.offsetParent) {
		x += obj.offsetLeft;
		y += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return { 'x': x, 'y': y };
}

function crossBrowserMousePos(e) {
	e = e || window.event;
	return {
		'x': e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
		'y': e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
	};
}

function crossBrowserRelativeMousePos(e) {
	var element = crossBrowserElementPos(e);
	var mouse = crossBrowserMousePos(e);
	return {
		'x': mouse.x - element.x,
		'y': mouse.y - element.y
	};
}

// stop console from breaking if it's not there.
if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}

//          r   g   b   a
// input: [ 00, 00, 00, 00]
// output: "rgba(210, 229, 236, 255); /* #d2e5ec */"
//
function humanizeColor(colors) {
  var css = {}
  css.rgba = 'rgba('+ colors.join(', ') + ')'
  css.hex = toHex(css.rgba)
  css.text = css.rgba + '; /* ' + css.hex + ' */'
  return css
}

//
// via http://haacked.com/archive/2009/12/29/convert-rgb-to-hex.aspx
//
// Usage:
//      equals(colorToHex('rgb(120, 120, 240)'), '#7878f0');
//
function toHex(c) {
    var m = /rgba?\((\d+), (\d+), (\d+)/.exec(c);
    // console.log(m);
    return m ? '#' + ( m[1] << 16 | m[2] << 8 | m[3] ).toString(16)
             : c;
}

// via http://24ways.org/2010/calculating-color-contrast/
function getContrastYIQ(colors) {
  var r = colors[0]
  var g = colors[1]
  var b = colors[2]
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

function multiconvert(text) {
  var rgb
  // ignore invalid updates
  try {
    rgb = d3.rgb(text)
  } catch(e) {
    return
  }

  // ignore invalid updates
  var rgbarr = [ rgb.r, rgb.g, rgb.b ]
  // console.log('rgb', rgbarr)
  var part
  for (var i = 0; i < rgbarr.length; i++) {
    part = rgbarr[i]
    if (isNaN(part) || part < 0) {
      return
    }
  }
  var hsl = rgb.hsl()
  var colors =
    { hex: rgb.toString()
    , rgb: 'rgb(' + rgbarr.join(', ') + ')'
    , rgbarr: rgbarr
    , hsl: 'hsl(' + [ precision(hsl.h, 2), precision(hsl.s, 2), precision(hsl.l, 2) ].join(', ') + ')'
    }

  // console.log(colors)
  return colors
}

function precision(num, decimals) {
  var factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

// function getContrastYIQHex(hexcolor) {
//   var r = parseInt(hexcolor.substr(0, 2), 16);
//   var g = parseInt(hexcolor.substr(2, 2), 16);
//   var b = parseInt(hexcolor.substr(4, 2), 16);
//   var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
//   return (yiq >= 128) ? 'black' : 'white';
// }
