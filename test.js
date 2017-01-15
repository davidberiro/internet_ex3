/**
 * Created by David Benchimol on 1/15/2017.
 */

var server = require('./hujiwebserver');

server.use('/hello/world', function(req, res) {
    res.set('Content-Type', 'text/plain;');
    res.send('Hello world');
}).use('/add/:n/:m', function (req, res) {
    res.set('Content-Type', 'application/json;');
    var a = req.params.n * req.params.m;
    res.json({'result': a.toString()});
}).use('/filez/:path', function (req, res, next) {
    
})
