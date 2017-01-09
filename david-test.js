var fs = require('fs');
fs.readFile('./test.json', 'utf8', function (err, text) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(typeof text);
    console.log(text);
    testObj = JSON.parse(text);
    console.log(typeof testObj);
    console.log(testObj);
    console.log(testObj.dbs.test[0].username);
});
