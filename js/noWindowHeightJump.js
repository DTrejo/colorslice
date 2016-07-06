require('./lib/jquery-1.9.0.min.js')

// prevents window jumps when length of page changes
setInterval(function() {
  var html = $('html')
  var minheight = parseInt(html.css('min-height').replace('px', ''), 10)
  var height = parseInt(html.css('height').replace('px', ''), 10)
  html.css('min-height', Math.max(minheight, height))
}, 500)
