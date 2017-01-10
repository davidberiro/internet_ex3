const net = require("net");
const fs = require("fs");
const DEFAULT_COMMAND = '/';

// var socketRequest = socketListen(function (err, socketInput) {
//     parseSocketRequest(socketRequest);
// });
// console.log('Hello!');

var processCompleteHttpRequest = function (information) {
   return {
       params: []
       ,

   }
};

var createEmptyResponse = function () {
    return {
        set: function () {

        },
        get: function () {

        },
        status: function () {

        },
        cookie: function () {

        },
        send: function () {
            // We're
            var socket = null;
            net.

        },
        json: function () {

        }
    };
};


module.exports = {
    commands: [],
    use: function (cmd, middleware) {
        // Handle usage of type: .use(function (req, res, next) {})   (i.e., no "cmd" param)
        if (!middleware) {
            middleware = cmd;
            cmd = DEFAULT_COMMAND;
        }
        this.commands.push({ command: cmd, middleware: middleware });
        return this;
    },
    start: function (port, callback) {
        var server = net.createServer(function (socket) {
            var allInformationSoFar = '';
            socket.on("end", function () {
                // Create response containing all info
                var req = processCompleteHttpRequest(allInformationSoFar);
                var res = createEmptyResponse(); // Create an empty response object containing: send(), json(), etc., etc.

                var alreadyCalledCommands = [];
                var next = function () {
                    commandAndMiddleware = this._chooseBestCommandToMatchRequestExcludingAlreadyUsedOnes(
                        req, alreadyCalledCommands);
                    alreadyCalledCommands.push(commandAndMiddleware.command);
                    commandAndMiddleware.middleware(req, res, next);
                };
                next();
            });

            socket.on("error", function (err) {
                callback('Error creating server: ' + err);
            });

            // More events for receiving data, whether HTTP request is over, etc.
            socket.on("data", function (data) {
                allInformationSoFar += data;
            });


        });
        return {
            stop: function () {

            },
            port: port
        };
        //return a serverObj object that wraps the server variable which allow you to stop listening
        //return {stop:{server.stop?()}...} //<-- e.g.
    }
};
