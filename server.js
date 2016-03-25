var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');

var port = process.env.PORT || 3000;

mongoose.connect('mongodb://root:deronje@ds019628.mlab.com:19628/ecommerce_misa', function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to the database');
	}	


});

//add morgan middleware
app.use(morgan('dev'));

app.get('/', function(req, res){
	res.send('Hello world');
});

app.listen(port, function(err){
	if(err) throw err;

	console.log('Server is running on port ' + port);
});