var net = require('net');
const fs = require('fs');
const httpCodes = require('./httpCodes');
const DEFAULT_COMMAND = '/';


var createParamsObject = function (command, matchingCommand) {
    var params = {};
    var commandParams = command.split('/');
    var matchingCommandParams = matchingCommand.split('/');
    matchingCommandParams.forEach(function (param, index) {
        if (param[0] === ':') {
            var key = param.slice(1);
            // console.log(key);
            params[key] = commandParams[index];
        }
    });
    //console.log(params);
    return params;
};

var processCompleteHttpRequest = function (command, matchingCommand, parsedRequest) {
    //var obj = parseRequest(information);
    // -- now passed as parameter parsedRequest,
    //so that it can be used before to find the matching command in the socket.end event
    var body = createBody(parsedRequest);
    var cookies = {};
    var host = {};
    var headers = parsedRequest.headers;
    var params = createParamsObject(command, matchingCommand);
    var query = {};
    var protocol = 'http';
    if (parsedRequest.query) {
        query = parsedRequest.query;
    }
    if (headers['Host']) {
        host = headers['Host'];
    }
    if (headers['Cookie']) {
        var cookieSplit = headers['Cookie'].split('=');
        cookies[cookieSplit[0]] = cookieSplit[1];
        // cookies.value = cookieSplit[1];
    }
    var path = parsedRequest['path'];

    return {
        path: path
        ,
        protocol: protocol
        ,
        host: host
        ,
        params: params
        ,
        query: query
        ,
        headers: headers
        ,
        cookies: cookies
        ,
        body: body
        ,
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
                return this.params.name; /// i changed it to else if instead of if.
            }
            if (this.body && name in this.body) { // took it from post method or any other..
                return this.body.name;
            }
            if (name in this.query) { // done i guess .. does the get method have ?name=a&last=b?? (cuz we used that in the parsing function.
                return this.query.name;
            }
            return null;
        },
        is: function (type) { // could be one of 3 cases "html" or"text/html" or "text/*"
            // type = type.split(';')[0]; // text/html
            type = type.split('/'); // ["text", "html"]
            var receivedType = this.get('Content-Type'); /////////// could be text/html; charset=utf-8
            receivedType = receivedType.split(';')[0]; // text/html
            receivedType = receivedType.split('/'); // ["text", "html"]
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
    return {
        htmlResponse: {
            initialLine: {},
            headers: {}
        },
        set: function (field, value) {
            this.htmlResponse.headers[field] = value;
            return this;
        },
        get: function (field) {
            return this.htmlResponse.headers[field];
        },
        status: function (code) {
            if (!(code in httpCodes)) {
                throw new Error('Invalid status code');
            }
            this.htmlResponse.initialLine.status = code;
            this.htmlResponse.initialLine.msg = httpCodes[code];
            return this;
        },
        cookie: function(name, value, options) { // should only support expires (if not specified or set to 0 creates session cookie)
            var obj = {domain: 'localhost', path: "/"}; //secure: , signed: , maxAge: , httpOnly:, encode : encodeURIComponent,expires : 0
            var cookieValueEncode = encodeURIComponent; // this is the default unless options has another one
            // var objKeys = {};
            var defaultTimeout = 9000; // 9 secounds --> this should be changed
            // returnStr = name + '=' + value;
            var objKeys = Object.keys(obj);
            if (options) {
                // optionsKeys = Object.keys(options);
                // if(options.domain){
                //     obj.domain = options.domain;
                // }
                // if(options.path){
                //     obj.path = options.path;
                // }
                // if(options.encode){
                //     cookieValueEncode = options.encode;
                // }
                if (options.expires) { // && options.expires != 0 /// only support expires.
                    obj.expires = options.expires; //new Date(Date.now() + defaultTimeout);
                }
                objKeys = Object.keys(obj); // update obj.keys ..

            }
            returnStr = name + '=' + cookieValueEncode(value);
            objKeys.forEach(function (key) {
                var firstCharUpper = key.charAt(0).toUpperCase() + key.substr(1);
                returnStr += '; ' + firstCharUpper + '=' + obj[key]; // + '; ' ;
            });
           //console.log(returnStr);
            return returnStr;
        },
        send: function (body) {
            // Send status, cookies, Content-TYpe, etc.
            if (!body) {
                body = "";
            }
            var responseMsg = "HTTP/1.0 " + this.htmlResponse.initialLine.status + " " +
                this.htmlResponse.initialLine.msg + "\r\n";
            for (var key in this.htmlResponse.headers) {
                if (this.htmlResponse.headers.hasOwnProperty(key)) {
                    responseMsg += key + ": " + this.htmlResponse.headers[key] + "\r\n";
                }
            }
            responseMsg += "\r\n";
            responseMsg += body;
            //socket.write(responseMsg);
            //console.log("response message:\r\n %s", responseMsg);
            socket.write(responseMsg);
            socket.end();
            return this;
        }
        ,
        json: function (jsonResponse) {
            // TODO: Send headers with "Content-type: text/json" (something like that)
            this.send(JSON.stringify(jsonResponse));
            return this;
        }
    };
};

var isCommandMatch = function (command, potentialCommandMatch) {
    if (potentialCommandMatch === DEFAULT_COMMAND) {
        return true;
    }
    // if (command === DEFAULT_COMMAND) {
    //     return true;
    // }
    var matchSplit = potentialCommandMatch.split('/');
    var commandSplit = command.split('/');
    // console.log(commandSplit);
    // console.log(matchSplit);
    if (commandSplit.length < matchSplit.length) {
        return false;
    }

    var retVal = true;
    matchSplit.forEach(function (parameter, index) {
        if (parameter[0] != ':') {
            //console.log(parameter);
            if (parameter != commandSplit[index]) {
                //console.log('returning false');
                retVal = false;
            }
        }
    });
    if (retVal) {
        //console.log("command: %s\r\n", command);
        //console.log("matching command: %s", potentialCommandMatch);
    }
    return retVal;
}

var chooseBestCommand = function (commands, alreadyCalledCommands, command) {
    //iterates over commands, if its not in already calledcommands checks if its
    //a match, and if so returns {command, middleware}
    var cmd;
    // console.log("printing already called commands list");
    // console.log(alreadyCalledCommands);
    for (var i = 0; i < commands.length; i++) {
        // console.log(i);
        // console.log(commands.length);
        var commandAndMiddleware = commands[i];
        cmd = commandAndMiddleware.command;
        if (alreadyCalledCommands.indexOf(commandAndMiddleware) == -1) { // switch commandAndmw with cmd
            if (isCommandMatch(command, cmd)) {
                return commandAndMiddleware;
            }
        }
    }
    return {command: '/',
        middleware: function(res, req){
            req.status(404);
            req.send();
    }};
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
        //console.log('Starting...');
        this.commands.push({command: '/favicon.ico', middleware: notFoundMiddleware});
        var commands = this.commands;
        var server = net.createServer(function (socket) {
            setTimeout(function () {
                if (socket.connected) {
                    socket.end();
                    return;
                }
            }, 2500)
            //adding to clients
            socket.key = socket.remoteAddress + ":" + socket.remotePort;
            clients.push(socket);
            var allInformationSoFar = '';
            //console.log('Starting connection at %s', socket.key);
            //socket error event
            socket.on("error", function (err) {
                callback(err);
            });
            socket.on("data", function (data) {
                allInformationSoFar += data;
                //console.log("received data: \r\n %s", data);
                if (!(isCompleteHttpRequest(allInformationSoFar))) {
                    return;
                }
                //console.log("finished receiving data: %s", allInformationSoFar);
                //already called commands is empty array
                 var alreadyCalledCommands = [];
                //creating object that defines parsed request, which is going to be passed on to
                //processCompleteHttpRequest, as well as giving us the command/path
                var parsedRequest = parseRequest(allInformationSoFar);
                var command = parsedRequest.path;
                // Create response containing all info to be passed to middlewatr
                var res = createEmptyResponse(socket);
                //next function chooses and executes best middleware that we havent already called
                var next = function () {
                    var commandAndMiddleware = chooseBestCommand(commands, alreadyCalledCommands, command);
                    alreadyCalledCommands.push(commandAndMiddleware); //add .command
                    var req = processCompleteHttpRequest(command, commandAndMiddleware.command, parsedRequest);
                    commandAndMiddleware.middleware(req, res, next);
                    //setting 10 second timeout
                };
                next();
                setTimeout(function () {
                    if (socket.connected)
                    {
                        res.status(404);
                        res.send();
                    }
                }, 1000);
            });
        });

        server.listen(port);
        callback();

        return {
            stop: function () {
                server.close();
            },
            port: port
        };
    }
};

/// functions that were added

var notFoundMiddleware = function(req, res) {
    res.status(404);
    res.send();
}

var isCompleteHttpRequest = function (information) {
    var firstBodySeparator = '\n\n';
    var secondBodySeparator = '\r\n\r\n';
    if (information.indexOf(firstBodySeparator) > -1) {
        return isBodyComplete(firstBodySeparator, information);
    }
    if (information.indexOf(secondBodySeparator) > -1) {
        return isBodyComplete(secondBodySeparator, information);
    }
    //return true iff information is full http request
    return false;
};

function isBodyComplete(separator, info) {
    var separatedInfo = info.split(separator);
    if (separatedInfo[0].indexOf('Content-Length') > -1) {
        if (parseRequest(info).headers['Content-Length'] == (separatedInfo[1]).length) {
            return true;
        }
        return false;
    }
    return true;
}

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function parseRequest(requestText) {
    var nextLine = '\r\n';
    var retardSplitBody = requestText.split('\n\n');
    var separateBody = requestText.split('\r\n\r\n'); // separates the body from the rest of the request.
    if (retardSplitBody.length > separateBody.length) {
        separateBody = retardSplitBody;
        nextLine = '\n';
    }
    var headerStrings = separateBody[0].split(nextLine); // separateBody[0] is the headers text plus the line request.
    var headers = {};
    var others = {};
    others['body'] = separateBody[1];
    headerStrings.forEach(function (string) {
        var stringParts = string.split(": ");
        if (stringParts.length == 1) { // && stringParts != ""){ //this should give us request Line.
            if (splitRequestLine(stringParts, others)) { //check for an error
                //throw some error because the request line format isnt right.
                // socket.emit(error);
                //console.log('something is wrong with the syntax');
                // return ? (if not itll return only a {{body:"...", headers{....}}
            }
        }
        else if (stringParts.length == 2) { //headers
            headers[stringParts[0]] = stringParts[1];
        }
        else { // should exist?
            //console.log("parsing function 'else' ?!?!?!");
        }
    });
    if (headers.cookie) {
        headers['cookies'] = cookieParser(headers.cookie);
    }
    others["headers"] = headers;
    //console.log(others);
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
            queryItems[s[0]] = s[1].replace('+', ' ');
        });
        storage["query"] = queryItems;
        storage["path"] = URI[0];
    }
    return 0;
}

function cookieParser(givenCookie) {
    var cookieParams=[];
    var params = {};
    var subParams = {}; // everything besides the name and the value (the options in the res.cookie function)
    if(givenCookie.indexOf('=') > (-1)){
        var cookieNameAndValue = givenCookie.split('=');
    }
    else{
        console.log("syntax error");
        return 1;
    }
    if (givenCookie.indexOf('; ') > -1) { // if ; exists
        cookieParams = givenCookie.split('; ');
        cookieParams.forEach(function(param,index){
            if(param.indexOf('=') > (-1) && index != 0){
                var split = param.split('=');
                subParams[split[0]] = split[1];
            }
            // else{
            //     return; // skip this iteration
            // }
        });
        cookieNameAndValue = cookieParams[0].split('=');
    }
    params.name = cookieNameAndValue[0];
    params.value = cookieNameAndValue[1];
    params.subParams = subParams;
    return params;
}


function createBody(information) {
    if (information.body === '') {
        return null;
    }
    try {
        var response = JSON.parse(information.body);
    }
    catch(e) {
        response = information.body;
    }
    return response;
}
