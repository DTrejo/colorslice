require('./lib/jquery-1.9.0.min.js')
require('./lib/d3.v3.min.js')
require('./lib/excanvas.compiled.js')
var setComputedCanvasSize = require('./setComputedCanvasSize')
require('./noWindowHeightJump')

// widgets
var createSliceRack = require('./sliceRack')
var createSearchReplace = require('./searchReplace')

// TODO factor out the drag & drop
// TODO factor out color sampling
var crossBrowserRelativeMousePos = require('./crossBrowserRelativeMousePos')
var str2colors = require('./str2colors')
var cancel = require('./cancel')

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
var rack;
var searchReplace;

$(document).ready(function() {
  $canvas = $('#screen');
  canvas = $canvas.get(0);
  context = canvas.getContext('2d');

  $canvas.mousemove(mousemove)
  $canvas.mousedown(mousedown)
  $canvas.mouseup(mouseup)
  $canvas.bind('dragover', cancel)
  $canvas.bind('dragenter', cancel)
  $canvas.bind('dragleave', cancel)
  canvas.addEventListener('drop', drop, false)
  zoom = $('#zoom').get(0)
  zoomcontext = zoom.getContext('2d')
  swatch = $('#swatch').get(0)
  swatchcontext = swatch.getContext('2d')
  current = $('#current')

  rack = createSliceRack('body', '#colors')
  searchReplace = createSearchReplace('#recolors', '#screen')

  setComputedCanvasSize()
});

// keeps mouse coordinates accurate
$(window).resize(setComputedCanvasSize);

function mousemove(event) {
  // get mouse position relative to the canvas element
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
    var colors = str2colors('rgb(' + rgbarr.join(', ') + ')');
    current.text([ colors.hex
                 , colors.rgb
                 , colors.hsl.split('(').join('(\n')
                    .split(')').join('\n)').split(', ').join(', \n')
                  ].join('\n'));
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
  // capture pixel, display it.
  var d = swatchcontext.getImageData(0, 0, 4, 4).data;
  var colors = [ d[0], d[1], d[2], d[3] ];
  var rgbarr = [ d[0], d[1], d[2] ];

  rack.addSlice(rgbarr)
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

      // so search will be re-run.
      searchReplace.original = null
    }

    image.src = event.target.result;
  }

  reader.readAsDataURL(file);
  return cancel(event);
}
