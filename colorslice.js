var sys = require('sys')
  , ns = require('node-static')
  , PORT = 8083;

//
// Create a node-static server to serve the current directory
//
var file = new(ns.Server)('./public', { cache: 3600 });

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response, function (err, res) {
            if (err) { // An error as occured
                sys.error("> Error serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            } else { // The file was served successfully
                sys.puts("> " + request.url + " - " + res.message);
            }
        });
    });
}).listen(PORT);

sys.puts("> node-static is listening on http://127.0.0.1:"+PORT);