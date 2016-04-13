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
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

var User = require('./models/user');
var secret = require('./config/secret');
var Category = require('./models/category');

var port = process.env.PORT || 3000;

mongoose.connect(secret.database, function(err){
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
	secret: secret.secretKey,
	store: new MongoStore({ url: secret.database, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//declaring middleware to use object in every routes
app.use(function(req, res, next){
	// now every routes has user object by default
	res.locals.user = req.user;
	next();
});

app.use(function(req, res, next){
	// {} - search for everything
	Category.find({}, function(err, categories){
		if(err) return next(err);
		res.locals.categories = categories;
		next();
	});
});

// Engine
app.engine('ejs', engine);
app.set('view engine', 'ejs'); 

//Route
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

app.listen(port, function(err){
	if(err) throw err;

	console.log('Server is running on port ' + port);
});