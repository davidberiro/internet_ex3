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
    if (others.query) {
        console.log("contains query");
    }
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

parseRequest('POST /test/json HTTP/1.1\r\nHost: localhost:8080\r\nConnection: keep-alive\r\nContent-Type: application/json\r\nContent-Length: 21\r\n\r\n{"omer":5,"gabi":"7"}');