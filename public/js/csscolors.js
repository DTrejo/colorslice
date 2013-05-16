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
  // console.log(r.toString())
  return colors
}

csscolors.findReplace = function findReplace (css, replacements) {
  // convert top and bottom range to hues
  replacements = replacements.map(function(rep) {
    rep.tophue = (rep.ocolor.h + rep.top) % 360
    rep.bothue = (rep.ocolor.h - rep.bot) % 360
    return rep
  })

  // don't care about which colors were replaced, only result
  var r = rework(css).use(colorscraper([], replacements))
  return r.toString()
}

//
// note: this isnt really a public API. as you can see from this comment,
// it is too complicated to use.
// TODO: split this up better. the rules should be separate, the
// "scrape" inline function should be passed in from outside.
//
// to simply scrape colors out of css into an array:
//
//   var colors = []
//   var r = rework(css).use(colorscraper(colors))
//   // colors array is now populated
//
// takes an OPTIONAL array of replacements, just like recolor.js
//
//   var replacements = [{
//     ocolor: d3.hsl('rgb(252, 232, 173)'),
//     ncolor: d3.hsl('blue'),
//     top: 30,
//     bot: 50
//   }]
//  var r = rework(css).use(colorscraper(colors, replacements))
//  var modifiedCSS = r.toString()
//
function colorscraper (colors, replacements) {
  var hsla =
    'hsla?'              // match both hsl and hsla
    + '\((.*),(.*),(.*)' // match left paren and h, s, l
    + '(?:,.*)?\)'       // optionally match alpha, always match right paren

  var rgba =
    'rgba?'              // match both rgb and rgba
    + '\((.*),(.*),(.*)' // match left paren and r, g, b
    + '(?:,.*)?\)'       // optionally match alpha, always match right paren

  var hex = '#[0-9a-f]{6}'         // only #00000f
  var shorthex = '#[0-9a-f]{3}(?![0-9a-f]{3})' // only #00f, not #00f00f
  var wordcolor = '(?:[a-z][a-z]+);?$'

  var rules = {}
  // yeah this looks funny huh?
  rules[hsla] = rules[rgba] = rules[hex] = rules[shorthex] = rules[wordcolor]
    = scrape
  if (replacements) {
    rules[hsla] = rules[rgba] = rules[hex] = rules[shorthex] = rules[wordcolor]
      = scrapeAndReplace
  }
  console.log(rules)
  return matcher(rules)

  function scrape(decl, _, _, _, _) {
    var c = d3.rgb(decl.value.trim())
    if (!c) return
    console.log(decl.value, c.toString())
    colors.push(c)
    return c.toString()
  }

  function scrapeAndReplace(decl, _, _, _, _) {
    var c = d3.rgb(decl.value.trim())
    if (!c) return
    console.log(decl.value, c.toString())
    colors.push(c)

    // Return the modified color, replacing the old color.
    // From recolor.js
    var rep, r = 0, len = 0
    var hsl = c.hsl()
    for (var r = 0, len = replacements.length; r < len; r++) {
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

        // only apply the first matched replacement for this pixel
        return hsl.rgb()
      }
    }
    // leave it unmodified
    return c.toString()
  }
}

// based on rework/lib/function.js
function matcher (rules) {
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
          // console.log(regex, decl)
          decl.value = decl.value.replace(regex, replacer, 'gi')
          function replacer (_, m1, m2, m3) {
            return rules[key](decl, m1, m2, m3)
          }
          // can only match one rule
          break
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

    // test findReplace
    var replacements = [{
      ocolor: d3.hsl('rgb(252, 232, 173)'),
      ncolor: d3.hsl('blue'),
      top: 30,
      bot: 50
    }]
    var newCSS = csscolors.findReplace(css, replacements)
    $('style').first().text(newCSS)
    console.log('findReplace:\n', newCSS)
  })

  var input = $('input')
  input.change(function(e) {
    for (var i = 0; i < input[0].files.length; i++) {
      var file = input[0].files[i]
      var r = new FileReader()
      r.readAsText(file);
      r.onload = function(e) {
        var css = e.target.result
        console.log(file.type)
        if (!file.type.match('text.*')) return // TODO give user an error
        var colors = csscolors(css)
        console.log(colors)
        $('body').append('<br><br>' + colors.join('<br>'))

        // test findReplace
        var replacements = [{
          ocolor: d3.hsl('rgb(252, 232, 173)'),
          ncolor: d3.hsl('blue'),
          top: 30,
          bot: 50
        }]
        console.log('findReplace:\n', csscolors.findReplace(css, replacements))
      };
    }
  })
}
