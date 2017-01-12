const net = require("net");
const fs = require("fs");
const httpCodes = require('./httpCodes');
const DEFAULT_COMMAND = '/';

// var socketRequest = socketListen(function (err, socketInput) {
//     parseSocketRequest(socketRequest);
// });
// console.log('Hello!');

var processCompleteHttpRequest = function (information) {
    var obj = parseRequest(information);
    var body = null;
    return {
        params: { // obj['params']

        },
        query: { // obj['query']

        },
        body: function () {
            // Parse the body object.
            // TODO: fixed body to deal with ->("POST name=tobi&hobby=ass" should
            // TODO: give tobi for req.param(name) .. check it.

            // Only parse the body once.
            if (body) {
                return body;
            }
            if(obj.method === 'POST' && obj.headers['Content-Type'] === 'application/x-www-form-urlencoded' ){
                body = parseParameters(obj.body);
            } else if (false) {
                // other instances of the post body and how we parse it ..
                // maybe we should create a file that parses everything fully..
            } else {
                // the thing we got from the parse function (as it was before
                // (unrecognised info response should be an error)
                body = obj.body
            }
            return body;
        },
        headers: { // obj['headers']

        },
        get: function (field) { // would check for "Content-Type"     //// used it in the is() function.
           if (field in this.headers) {
               return this.headers.field;
           }
           return null;
           // else if(field.toLowerCase() in this.headers){          //would check for "content-type" aswell TODO:uncomment this shit .
           //     var lowerField = field.toLowerCase();
           //     return this.headers.lowerField;
           // }
        },
        param: function (name) { //
           if (name in this.params) { // deal with "user/:name" command
               return this.params.name; /// i changed it to else if instead of if.
           }
           if (name in this.body) { // took it from post method or any other..
               return this.body.name;
           }
           if (name in this.query) { // done i guess .. does the get method have ?name=a&last=b?? (cuz we used that in the parsing function.
               return this.query.name;
           }
           return null;
        },
        is: function(type) { // could be one of 3 cases "html" or"text/html" or "text/*"
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
    var bodyObj = {};
    var splitBody = paramsStr.split('&');
    splitBody.forEach(function (data) {
        data = data.split('=');
        bodyObj[data[0]] = data[1];
    });
    return bodyObj;
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
            return this;
        },
        cookie: function () {

        },
        send: function (body) {
            // Send status, cookies, Content-TYpe, etc.
            var responseMsg = htmlResponse.initialLine.status + "/r/n";
            for (var key in htmlResponse.headers) {
                if (htmlResponse.headers.hasOwnProperty(key)) {
                    responseMsg += key + ": " + htmlResponse.headers.key + "/r/n";
                }
            }
            responseMsg += body;
            socket.write(responseMsg);
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

var socketList = [];

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
        console.log('Starting...');
        var server = net.createServer(function (socket) {
            //socketList.push(socket);
            var allInformationSoFar = '';
            socket.on("end", function () {
                console.log('End');
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
                //socket.destroy();
            });

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
                socketList.forEach(function(socket,index){ // sockets already contains the socket that was added when the server was first created.
                    // var index = socketList.indexOf(socket);
                    socket.destroy();
                    socketList.splice(index, 1); // remove from the list .. but the list is changing .. dont know if this is a good idea.
                    // use ((delete socketlist[index] .. leaves an "undefined" instead of the element (doesnt change list)
                });
            },
            port: port
        };
        //return a serverObj object that wraps the server variable which allow you to stop listening
        //return {stop:{server.stop?()}...} //<-- e.g.

    }

};

/// functions that were added

function parseRequest(requestText){
    var separateBody = requestText.split('\r\n\r\n'); // separates the body from the rest of the request.
    var headerStrings = separateBody[0].split('\r\n'); // separateBody[0] is the headers text plus the line request.
    var headers = {};
    var others = {};
    others['body'] = separateBody[1];
    headerStrings.forEach(function(string){
        var stringParts = string.split(": ");
        if(stringParts.length == 1 && stringParts != ""){
            splitRequestLine(stringParts,others);
        }
        else if(stringParts.length == 2){
            headers[stringParts[0]] = stringParts[1];
        }
        else{
            console.log("parsing function 'else' ?!?!?!");
        }
    });
    others["headers"] = headers;
    console.log(others);
    return others;
}

function splitRequestLine(requestLine, storage){
    requestLine = requestLine[0].split(" ");
    storage["method"] = requestLine[0];
    var URI = requestLine[1].split('?'); // -------------------> figure out if this name is okay.
    var parameters = URI[0].split('/');
    parameters.splice(0,1); // remove the first element (which is "")
    var querySplit = URI[1].split('?');
    var queryItems = {};
    querySplit = querySplit[0].split('&');

    querySplit.forEach(function (item)
    {
        var s = item.split('=');
        queryItems[s[0]] = s[1];
    });

    storage["params"] = parameters;
    storage["query"] = queryItems;
    storage["path"] = URI[0];
    storage["protocol"] = requestLine[2].split('/')[0].toLowerCase();
}
