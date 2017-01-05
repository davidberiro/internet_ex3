var net = require('net');
var fs = require('fs');

var connections = [];

// var recievedSplitted = {GET:"", Host:"", Connection:"",   }
module.exports =
    {
        start : function(port , callback) {
            var server = net.createServer();
            server.on("connection", function (socket) {
                console.log("new connection was made");
                socket.setEncoding('utf8'); // not necessary??!?
                socket.on("data",function(recieved){

                    connections.push(recieved);

                    var splitStr = recieved.split('\r\n');
                    console.log((splitStr[0].split(' '))[1]);
                    // console.log(splitStr);
                });

                socket.on("error",function(err)
                {
                    // console.log("**");
                    callback(err);
                    // socket.end("an error occured");
                });

                // server.stop = function() {
                //     console.log("**********************"); ///////// stop functionality doesnt work (not a function)
                //     socket.destroy();
                // };

                socket.once("close",function()
                {
                    socket.write("connection was closed");
                });
                // setTimeout(socket.destroy,1000);

            });
            server.listen(port, function () {
                console.log("server is running on port : " + port);
            });
            return server;
        }
        // handleConnections: function(request)
        // {
        //     connections.push(request)
        // }
    };





