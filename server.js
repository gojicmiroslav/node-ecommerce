var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');

var User = require('./models/user');

var port = process.env.PORT || 3000;

mongoose.connect('mongodb://root:deronje@ds019628.mlab.com:19628/ecommerce_misa', function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to the database');
	}	
});

//Middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('ejs', engine);
app.set('view engine', 'ejs'); 

app.get('/', function(req, res){
	res.render('./main/home');
});

app.get('/about', function(req, res){
	res.render('./main/about');
});

app.post('/create-user', function(req, res, next){
	var user = new User();
	user.profile.name = req.body.name;
	user.email = req.body.email;
	user.password = req.body.password;

	// user - saved user
	user.save(function(err, user){
		if(err) return next(err);

		res.json('Successfully saved user: ' + user);	
	});
});

app.listen(port, function(err){
	if(err) throw err;

	console.log('Server is running on port ' + port);
});