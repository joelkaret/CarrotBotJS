var http = require('http');

http.createServer(function (req, res) {
  	res.write("I'm alive");
	res.write("\nI'm not lying");
  	res.end();
}).listen(8080);