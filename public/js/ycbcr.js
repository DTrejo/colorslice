require('./lib/d3.v3.min.js')

//
// Converting RGB to YCbCr
//
module.exports = createYcbcr

function createYcbcr(r, g, b) {
  return new Ycbcr(r, g, b)
}

function Ycbcr(r, g, b) {
  this.y  = ( .299 * r + .587 * g  +  0.114 * b) + 0
  this.cb = ( -.169 * r + -.331 * g +  0.500 * b) + 128
  this.cr = ( .500 * r + -.419 * g +  -0.081 * b) + 128
}

Ycbcr.prototype.rgb = function rgbPrecise() {
  var y = this.y, cb = this.cb, cr = this.cr

  var r = 1 * y +  0 * (cb-128)      +  1.4 * (cr-128)
  var g = 1 * y +  -.343 * (cb-128)  +  -.711 * (cr-128)
  var b = 1 * y +  1.765 * (cb-128)  +  0 * (cr-128)

  return d3.rgb(r, g, b)
}

Ycbcr.prototype.toString = function toString() {
  return this.y + ',' + this.cb + ',' + this.cr;
}

if (!module.parent) {
  console.log(createYcbcr(255, 0, 255).rgb())
}
