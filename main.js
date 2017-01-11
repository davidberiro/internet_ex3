// minimal usage main.js:
var server = require('./hujiwebserver');

// server.use('/add/:a/:b', function (req, res, next) {
//     res.send('<h1>' + (req.params.a + res.params.b) + '</h1>');
//     next();
// }).use('/like-a-post/id/:id', function (req, res, next) {
//     increaseNumberOfLikesOfPostByIdInDatabase(req.params.id, function (err) {
//         if (err) {
//             // Handle error...
//             return;
//         }
//         res.json({
//             success: true
//         });
//         next();
//     });
// }).use('/', function (req, res) {
//     res.send('Potato');
// }).start(80);

server.start(8080);
