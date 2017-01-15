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

parseRequest('GET /main.html HTTP/1.1\nHost: localhost\nUpgrade-Insecure-Requests: 1\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\nDNT: 1\nAccept-Encoding: gzip, deflate, sdch, br\nAccept-Language: en-US,en;q=0.8,he;q=0.6\n');