module.exports = setComputedCanvasSize

// otherwise mouse coordinates in canvas are not accurate.
function setComputedCanvasSize() {
  $('canvas').each(function(i, el) {
    // TODO use $.css?
    var s = getComputedStyle(el)
    var h = s.height
    var w = s.width
    el.width = parseInt(w, 10)
    el.height = parseInt(h, 10)
  })
}
