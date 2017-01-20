/**
 * Created by David Benchimol on 1/15/2017.
 */

var fs = require('fs');
var server = require('./hujiwebserver');

var err = function (err) {
    console.log("erorrrrrr" + err);
}

server.use('/hello/world', function(req, res) {
    res.status(200);
    res.set('Content-Type', 'text/plain;');
    res.send('Hello world');
}).use('/add/:n/:m', function (req, res) {
    res.status(200);
    res.set('Content-Type', 'application/json;');
    var a = req.params.n * req.params.m;
    res.json({'result': a.toString()});
}).use('/filez/:path', function (req, res, next) {
    // var loc = window.location.pathname;
    // var dir = loc.substring(0, loc.lastIndexOf('/'));
    var path = req.params.path;
    var filePath = './filez/' + path;
    console.log(filePath);
    if (path.substr(path.length - 4) == 'html') {
        res.set('Content-Type', 'text/html'); //DEBUG ATTENTION - maybe add ; to end of text/html str
    }
    else if (path.substr(path.length - 3) == 'css') {
        res.set('Content-Type', 'text/css'); //DEBUG ATTENTION - maybe add ; to end of text/html str
    }
    else if (path.substr(path.length - 2) == 'js') {
        res.set('Content-Type', 'application/javascript'); //DEBUG ATTENTION - maybe add ; to end of text/html str
    }
    else {
        res.status(404);
        res.send();
        return;
    }
    var content = "";
    fs.readFile(filePath, function(err, data) {
        if (err) {
            console.log("error reading file");
            throw err;
        }
        content = data;
        res.status(200);
        //console.log("printing request object");
        //console.log(req);
        res.send(content);
    });
}).start(8080, err);
