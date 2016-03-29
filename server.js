var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');

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
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "Miroslav%@#@#$@#"
}));
app.use(flash());

// Engine
app.engine('ejs', engine);
app.set('view engine', 'ejs'); 

//Route
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
app.use(mainRoutes);
app.use(userRoutes);


app.listen(port, function(err){
	if(err) throw err;

	console.log('Server is running on port ' + port);
});