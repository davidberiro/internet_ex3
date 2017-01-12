// minimal usage main.js:
var server = require('./hujiwebserver');

server.use('/add/:a/:b', function (req, res, next) {
    res.send('<h1>' + (--req.params.a + --res.params.b) + '</h1>');
}).start(80);
