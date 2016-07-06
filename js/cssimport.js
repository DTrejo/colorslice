require('./lib/jquery-1.9.0.min.js')
var a = require('assert')
var _ = require('./lib/underscore.js')
var csscolors = require('./csscolors')

module.exports = cssimport

function cssimport(input, rack) {
  var input = $(input)
  a.ok(input.length)
  a.ok(rack)

  input.change(function(e) {
    for (var i = 0; i < input[0].files.length; i++) {
      var file = input[0].files[i]
      var r = new FileReader()
      r.readAsText(file);
      r.onerror = console.log
      r.onload = function(e) {
        var css = e.target.result
        // console.log(file.type)
        if (!file.type.match('text.*')) return // TODO give user an error

        // TODO possibly sort by Y component of ycbcr?
        var colors = _.uniq(
          csscolors(css).map(function(c) { return c.toString() })
        ).sort()
        rack.addDivider()
        colors.forEach(function(str) {
          var c = d3.rgb(str)
          var rgbarr = [c.r, c.g, c.b];
          rack.addSlice(rgbarr);
        })
        rack.addDivider()
      };
    }
  })
}
