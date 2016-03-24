var express = require('express');
var app = express();
var morgan = require('morgan');

var port = process.env.PORT || 3000;

//add morgan middleware
app.use(morgan('dev'));

app.get('/', function(req, res){
	res.send('Hello world');
});

app.listen(port, function(err){
	if(err) throw err;

	console.log('Server is running on port ' + port);
});