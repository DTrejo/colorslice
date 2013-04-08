// takes a css string, finds all the instances of colors, then returns them
// eventually "css" will optionally mean stylus, and maybe even less/sass.

require('./lib/d3.v3.min.js')
var assert = require('assert')
var rework = require('../../vendor/rework')
var visit = rework.visit

module.exports = csscolors

function csscolors (css) {
  var colors = []
  var r = rework(css).use(colorscraper(colors))
  console.log(r.toString())
  return colors
}

function colorscraper (colors) {
  var hsla =
    'hsla?'              // match both hsl and hsla
    + '\((.*),(.*),(.*)' // match left paren and h, s, l
    + '(?:,.*)?\)'       // optionally match alpha, always match right paren

  var rgba =
    'rgba?'              // match both rgb and rgba
    + '\((.*),(.*),(.*)' // match left paren and r, g, b
    + '(?:,.*)?\)'       // optionally match alpha, always match right paren

  var hex = '#\\d\\d\\d\\d\\d\\d'         // only #000000
  var shorthex = '#\\d\\d\\d(?!\\d\\d\\d)' // only #000, not #000000

  var rules = {}
  rules[hsla] = rules[rgba] = rules[hex] = rules[shorthex] = scrape
  console.log(rules)
  return matcher(rules)

  function scrape(decl, _, _, _, _) {
    var c = d3.rgb(decl.value.trim())
    if (!c) return
    colors.push(c)
    return c.toString()
  }
}

// based on rework/lib/function.js
function matcher (rules) {
  console.log('bang')
  var valid = Object.keys(rules).forEach(function(k) {
    if (typeof k !== 'string') throw new Error('object must have string keys')
  })

  return function(style, rework) {
    visit.declarations(style, function(declarations) {
      declarations.forEach(function(decl) {

        // very few rules, very many declarations.
        for (var key in rules) {
          var regex = new RegExp(key, 'gi')
          if (!regex.test(decl.value)) continue;
          console.log(regex, decl)
          decl.value = decl.value.replace(regex, replacer, 'gi')
          function replacer (_, m1, m2, m3) {
            return rules[key](decl, m1, m2, m3)
          }
        }
      })
    })
  }
}

if (window.location.pathname === '/csscolors.html') {
  require('./lib/jquery-1.9.0.min.js')
  $(function() {
    console.log('hi')
    var css = $('style').first().text()
    console.log(css)
    $('body').append($('<pre></pre>').text(css))

    var colors = csscolors(css)
    console.log(colors)
    $('body').append(colors.join('<br>'))

  })
}