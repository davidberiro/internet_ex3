const net = require("net");
const fs = require("fs");
const DEFAULT_COMMAND = '/';

// var socketRequest = socketListen(function (err, socketInput) {
//     parseSocketRequest(socketRequest);
// });
// console.log('Hello!');

var processCompleteHttpRequest = function (information) {
   return {
       params: {

       },
       query: {

       },
       body: {

       },
       headers: {

       },
       get: function (field) {
           if (field in this.headers) {
               return this.headers.field;
           }
       },
       param: function (name) {
           if (name in this.params) {
               return this.params.name;
           }
           if (name in this.body) {
               return this.body.name;
           }
           if (name in this.query) {
               return this.query.name;
           }
       },
       is: function (type) {
           
       }
   }
};

var createEmptyResponse = function (socket) {
    return {
        htmlResponse: {initialLine:{}, headers:{}}
        ,
        socket: socket
        ,
        set: function (field, value) {
            this.htmlResponse.headers.field = value;
        },
        get: function (field) {
            return this.htmlResponse.headers.field;
        },
        status: function (code) {
            this.htmlResponse.initialLine.status = code;
        },
        cookie: function () {

        },
        send: function (body) {
            responseMsg = this.htmlResponse.initialLine.status + "/r/n";
            for (var key in this.htmlResponse.headers) {
                if (this.htmlResponse.headers.hasOwnProperty(key)) {
                    responseMsg += key + ": " + this.htmlResponse.headers.key + "/r/n";
                }
            }
            responseMsg += body;
            this.socket.write(responseMsg);
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
                var res = createEmptyResponse(socket); // Create an empty response object containing: send(), json(), etc., etc.

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
