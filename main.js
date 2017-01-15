// minimal usage main.js:
var fs = require('fs');
var server = require('./hujiwebserver');

var err = function (err) {
    console.log("erorrrrrr" + err);
}

server.use('/:file', function (req, res, next) {
    if (!(req.params.file == 'main.html')) {
        console.log("nanaa");
        return;
    }
    var content = "";
    console.log("printing request obj");
    console.log(req);
    console.log("printing response object");
    console.log(res);
    res.set('Content-Type', 'text/html;');
    res.status(404);
    fs.readFile('./' + req.params.file, function read(err, data) {
        if (err) {
            console.log("error reading file");
            throw err;
        }
        content = data;
        // console.log(data);
        res.status(200);
        res.send(content);
    });
}).start(80, err);


