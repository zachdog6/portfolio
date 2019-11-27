var http = require("http");
var url = require("url");
var fs = require("fs");

/**
 * Example of creating a pure Node.JS server
 */
http.createServer((req, res) => {

    res.writeHead(200, {"Content-Type":"text/html"});

    let pathname = url.parse(req.url, true).pathname;

    if(pathname == "/download/events") {
        let readerStream = fs.createReadStream("files/test.txt");
        readerStream.setEncoding("UTF8");

        let data = "";
        readerStream.on("data", function(chunk) {
            data += chunk;
        });

        readerStream.on("end",function() {
            res.write(data);
            res.end();
        });
    } else if(pathname == "/download/pipe") {
        let readerStream = fs.createReadStream("files/test.txt");
        readerStream.setEncoding("UTF8");

        readerStream.pipe(res);
    } else {
        res.write("Hello World!");
        res.end();
    }
}).listen(8080);