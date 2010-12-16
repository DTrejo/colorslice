var ns = require('node-static');
var fileServer = new ns.Server('.');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}).listen(8080);