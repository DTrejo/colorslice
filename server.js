var tako = require('tako')
  , path = require('path')
  , app = tako()
  , PUBLIC = path.join(__dirname, 'public')
  , PORT = 8080
  // , PROXY_PORT = 80

app.route('/').file(PUBLIC)
app.route('/*').files(PUBLIC)

// app.notfound.html = path.join(PUBLIC, '404.html')

app.httpServer.listen(PORT)

tako.version =
  tako.version
  || require('./node_modules/tako/package.json').version

console.log('dtrejo.com Listening on http://localhost:' + PORT
  + '/ with tako@' + tako.version + ' and node@' + process.version
)
