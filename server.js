var express = require('express');
var app = express();

var port = process.env.PORT || 3000;

app.get('/', function(req, res){
	res.send('Hello world');
});

app.listen(port, function(err){
	if(err) throw err;
	
	console.log('Server is running on port ' + port);
});