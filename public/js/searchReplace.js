// require('./lib/jquery-1.9.0.min.js')
// var recolor = require('./recolor.js')
// var _ = require('./lib/underscore.js')

// module.exports = SearchReplace

// function SearchReplace(container, canvas) {
//   var self = this
//   self.container = $(container)
//   self.canvas = $(canvas)

//   var wait = 1000
//   self.container
//     .on('keyup blur',  '.color .recolor .ncolor', _.debounce(self.recolorImage, wait))
//     .on('keyup', '.color .recolor .top', _.debounce(self.recolorImage, wait))
//     .on('keyup', '.color .recolor .bot', _.debounce(self.recolorImage, wait))
// }

// // ocolor is the color of the current swatch.
// // ocolor will be swapped out for ncolor
// var last = '' // so we don't recalc the same image, and slow stuff down.
// var lastImageData
// var original
// SearchReplace.prototype.recolorImage = function recolorImage (e) {
//   var self = this
//   console.log('attempt recolorImage')
//   var recolordiv = $(e.target).parent()
//   var top = parseInt(recolordiv.children('.top').text(), 10);
//   var bot = parseInt(recolordiv.children('.bot').text(), 10);
//   if (top < 0 || bot < 0
//     || isNaN(top) || isNaN(bot)) {
//     console.log('invalid top or bottom range:', top, bot)
//     return
//   }

//   var el = recolordiv.parent().find('.hex')
//   var ocolor = d3.hsl(el.text())
//   el = recolordiv.children('.ncolor')
//   var ncolor = d3.hsl(el.text())
//   if (!ocolor || !ncolor) {
//     console.log('invalid original or new color:', ocolor, ncolor)
//     return
//   }

//   var canvas = $('#screen')[0]
//   console.log(canvas)
//   var ctx = canvas.getContext('2d')
//   curImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

//   var hash = [ocolor, ncolor, top, bot].join('')
//   if (last === hash && lastImageData === curImage) {
//     console.log('no change needed')
//     return
//   }
//   last = hash
//   lastImageData = curImage

//   console.log('recolor', ocolor, ncolor, top, bot)
//   var newImage = recolor(curImage, ocolor, ncolor, top, bot)
//   ctx.putImageData(newImage, 0, 0, 0, 0, newImage.width, newImage.height)
// };