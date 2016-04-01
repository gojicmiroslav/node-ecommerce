var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConfig = require('../config/passport');

router.get('/login', function(req, res){
	// if user is already logged in
	if(req.user){
		return res.redirect('/');
	}

	res.render('accounts/login', {
		message: req.flash('loginMessage')
	});
});

router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/profile', function(req, res, next){
	User.findOne({ _id: req.user._id }, function(err, user){
		if(err) return next(err);
		res.render('accounts/profile', { user: user });
	});
	
});

router.get('/signup', function(req, res, next){
	res.render('accounts/signup', {
		errors: req.flash('errors')
	});
});

router.post('/signup', function(req, res, next){
	var user = new User();
	user.profile.name = req.body.name;
	user.email = req.body.email;
	user.password = req.body.password;

	//validation
	//findONe - When executed, the first found document is passed to the callback.
	User.findOne({ email: req.body.email }, function(err, existingUser){
		if(err) return next(err);

		if(existingUser){
			req.flash('errors', 'Account with that email address already exists');	
			return res.redirect('/signup');
		} else {
			// user - saved user
			user.save(function(err, user){
				if(err) return next(err);
				return res.redirect('/');
			});
		}

	});

});

module.exports = router;