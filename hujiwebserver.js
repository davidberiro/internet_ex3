const net = require('net');
const fs = require('fs');
const httpCodes = require('./httpCodes');
const DEFAULT_COMMAND = '/';

// var socketRequest = clientsen(function (err, socketInput) {
//     parseSocketRequest(socketRequest);
// });
// console.log('Hello!');

var processCompleteHttpRequest = function (command, matchingCommand, parsedRequest) {
    //var obj = parseRequest(information);
    // -- now passed as parameter parsedRequest,
    //so that it can be used before to find the matching command in the socket.end event
    var body = null;

    return {
        params: { // parsedRequest['params']

        },
        query: { // parsedRequest['query']

        },
        body: function () {
            // Parse the body parsedRequestect.
            // TODO: fixed body to deal with ->("POST name=tobi&hobby=ass" should
            // TODO: give tobi for req.param(name) .. check it.

            // Only parse the body once.
            if (body) {
                return body;
            }
            if (parsedRequest.method === 'POST' && parsedRequest.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                body = parseParameters(parsedRequest.body);
            }
            else if (false) {
                // other instances of the post body and how we parse it ..
                // maybe we should create a file that parses everything fully..
            }
            else {
                // the thing we got from the parse function (as it was before
                // (unrecognised info response should be an error)
                body = parsedRequest.body
            }
            return body;
        },
        headers: { // parsedRequest['headers']

        },
        get: function (field) { // would check for "Content-Type"     //// used it in the is() function.
            if (field in this.headers) {
                return this.headers[field];
            }
            else if (field.toLowerCase() in this.headers) {          //would check for "content-type" aswell TODO:uncomment this shit .
                var lowerField = field.toLowerCase();
                return this.headers[lowerField];
            }
            return null;
        },
        param: function (name) { //
            if (name in this.params) { // deal with "user/:name" command
                return this.params[name]; /// i changed it to else if instead of if.
            }
            if (name in this.body) { // took it from post method or any other..
                return this.body[name];
            }
            if (name in this.query) { // done i guess .. does the get method have ?name=a&last=b?? (cuz we used that in the parsing function.
                return this.query[name];
            }
            return null;
        },
        is: function (type) { // could be one of 3 cases "html" or"text/html" or "text/*"
            // type = type.split(';')[0]; // text/html
            type = type.split('/'); // ["text", "html"]
            var receivedType = this.get('Content-Type'); /////////// could be text/html; charset=utf-8
            receivedType = receivedType.split(';')[0]; // text/html
            receivedType = receivedType.split('/'); // ["text", "html"]
            console.log(type);
            console.log(receivedType);
            /*     if type is(  'html'  or  'text/html'  or  'text/*')    */
            return (
                type[0] === receivedType[1]
                || (type[0] === receivedType[0] && type[1] === receivedType[1])
                || (type[0] === receivedType[0] && type[1] === '*')
            );
        }
    }
};

var parseParameters = function (paramsStr) {
    var bodyParsedRequest = {};
    var splitBody = paramsStr.split('&');
    splitBody.forEach(function (data) {
        data = data.split('=');
        bodyParsedRequest[data[0]] = data[1];
    });
    return bodyParsedRequest;
};

var createEmptyResponse = function (socket) {
    var htmlResponse = {
        initialLine: {},
        headers: {}
    };
    return {
        set: function (field, value) {
            htmlResponse.headers[field] = value;
            return this;
        },
        get: function (field) {
            return htmlResponse.headers[field];
        },
        status: function (code) {
            if (!(code in httpCodes)) {
                throw new Error('Invalid status code');
            }
            htmlResponse.initialLine.status = code;
            htmlResponse.initialLine.msg = httpCodes[code];
            return this;
        },
        cookie: function () {

        },
        send: function (body) {
            // Send status, cookies, Content-TYpe, etc.
            var responseMsg = htmlResponse.initialLine.status + " " + htmlResponse.initialLine.msg + "/r/n";
            for (var key in htmlResponse.headers) {
                if (htmlResponse.headers.hasOwnProperty(key)) {
                    responseMsg += key + ": " + htmlResponse.headers.key + "/r/n";
                }
            }
            responseMsg += "/r/n";
            responseMsg += body;
            socket.write(responseMsg);
            socket.end();
            // TODO: CLose connection, end.
            return this;
        },
        json: function (jsonResponse) {
            // TODO: Send headers with "Content-type: text/json" (something like that)
            this.send(JSON.stringify(jsonResponse));
            return this;
        }
    };
};

var chooseBestCommand = function (commands, alreadyCalledCommands, command) {
    //iterates over commands, if its not in already calledcommands checks if its
    //a match, and if so returns {command, middleware}
}

var clients = [];

module.exports = {
    commands: [],
    use: function (cmd, middleware) {
        // Handle usage of type: .use(function (req, res, next) {})   (i.e., no "cmd" param)
        if (!middleware) {
            middleware = cmd;
            cmd = DEFAULT_COMMAND;
        }
        this.commands.push({command: cmd, middleware: middleware});
        return this;
    },
    start: function (port, callback) {
        console.log('Starting...');
        var server = net.createServer(function (socket) {
            //adding to clients
            socket.key = socket.remoteAddress + ":" + socket.remotePort;
            clients.push(socket);
            var allInformationSoFar = '';

            //socket end event
            socket.on("end", function () {
                console.log('Ending connection at %s', socket.key);

                //defining list of already called commands
                var alreadyCalledCommands = [];
                //creating object that defines parsed request, which is going to be passed on to
                //processCompleteHttpRequest, as well as giving us the command/path
                var parsedRequest = parseRequest(allInformationSoFar);
                var command = parsedRequest.path;
                // Create response containing all info to be passed to middlewatr
                var res = createEmptyResponse(socket);

                //next function chooses and executes best middleware that we havent already called
                var next = function () {
                    var commandAndMiddleware = chooseBestCommand(this.commands, alreadyCalledCommands, command);
                    alreadyCalledCommands.push(commandAndMiddleware.command);
                    var req = processCompleteHttpRequest(command, commandAndMiddleware.command, parsedRequest);
                    commandAndMiddleware.middleware(req, res, next);
                };
                //calling next function with empty alreadyCalledCommands executes the middleware
                next();
                //socket.destroy();
            });

            //socket error event
            socket.on("error", function (err) {
                callback('Error creating server: ' + err);
            });

            // More events for receiving data, whether HTTP request is over, etc.
            socket.on("data", function (data) {
                allInformationSoFar += data;
                console.log("received data");
            });


        });

        server.listen(port);

        return {
            stop: function () {
                server.close(); //(callback);??? ...stops accepting new connections.
                clients.forEach(function (client) { // sockets already contains the socket that was added when the server was first created.
                    // var index = clients.indexOf(socket);

                    clients.splice(clients.indexOf(client), 1);
                    client.destroy();
                    // remove from the list .. but the list is changing .. dont know if this is a good idea.
                    // use ((delete clients[index] .. leaves an "undefined" instead of the element (doesnt change list)
                });

            },
            port: port
        };

    }

};

/// functions that were added

function parseRequest(requestText) {
    var separateBody = requestText.split('\r\n\r\n'); // separates the body from the rest of the request.
    var headerStrings = separateBody[0].split('\r\n'); // separateBody[0] is the headers text plus the line request.
    var headers = {};
    var others = {};
    others['body'] = separateBody[1];
    headerStrings.forEach(function (string) {
        var stringParts = string.split(": ");
        if (stringParts.length == 1) { // && stringParts != ""){ //this should give us request Line.
            if (splitRequestLine(stringParts, others)) { //check for an error
                //throw some error because the request line format isnt right.
                // socket.emit(error);
                console.log('something is wrong with the syntax');
                // return ? (if not itll return only a {{body:"...", headers{....}}
            }
        }
        else if (stringParts.length == 2) { //headers
            headers[stringParts[0]] = stringParts[1];
        }
        else { // should exist?
            console.log("parsing function 'else' ?!?!?!");
        }
    });
    others["headers"] = headers;
    console.log(others);
    return others;
}

//parseRequest helper.
function splitRequestLine(requestLine, storage) {
    requestLine = requestLine[0].split(" ");
    if (requestLine.length != 3) { // the request should be made of 3 parts [METHOD PATH HTTP/VERSION]
        return 1; // something is wrong .
    }
    storage["method"] = requestLine[0];
    storage["protocol"] = requestLine[2].split('/')[0].toLowerCase();
    var URI = requestLine[1];
    storage["path"] = URI;
    if (requestLine[1].indexOf('?') > -1) { // if its -1 means theres no '?'
        URI = requestLine[1].split('?'); // -------------------> figure out if this name is okay.
        var querySplit = URI[1].split('?');
        var queryItems = {};
        querySplit = querySplit[0].split('&');

        querySplit.forEach(function (item) { // match a key to a value.
            var s = item.split('=');
            queryItems[s[0]] = s[1];
        });
        storage["query"] = queryItems;
        storage["path"] = URI[0];
    }
    return 0;
}
