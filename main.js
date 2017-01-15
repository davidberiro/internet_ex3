// minimal usage main.js:
var server = require('./hujiwebserver');

var err = function (err) {
    console.log("erorrrrrr" + err);
}

server.use('/add/:a/:b', function (req, res, next) {
    res.status("200");
    res.send(req.params.a + req.params.b);
}).start(80, err);


