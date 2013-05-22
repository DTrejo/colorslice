module.exports = str2colors

// TODO stop using this and use kul.js, which supports alpha colors.
function str2colors (text) {
  if (!text.trim()) return

  var rgb
  // ignore invalid updates
  try {
    rgb = d3.rgb(text)
  } catch (e) {
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
  // console.log(hsl);
  var colors =
    { hex: rgb.toString()
    , rgb: 'rgb(' + rgbarr.join(', ') + ')'
    , rgbarr: rgbarr
    , hsl: 'hsl('
      + [ precision(hsl.h, 2), toPercent(hsl.s), toPercent(hsl.l) ].join(', ')
      + ')'
    , obj: rgb
    }

  // console.log(colors)
  return colors
}

function toPercent(num) {
  return precision(num * 100, 2) + '%'
}

function precision(num, decimals) {
  var factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}
