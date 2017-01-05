var s = require("./server");

function handleError(err)
{
    console.log(err.message);
}

var ss = s.start(8080,handleError);
// setTimeout(test,2000);
//
// function g(error,count)
// {
//     console.log(count);
// }
// // ss.stop();
//
// function test()
// {
//     console.log(ss.getConnections(g));
// }