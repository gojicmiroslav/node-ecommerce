var router = require('express').Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var stripe = require('stripe')('sk_test_ggRZi0nf3GsgiyqUbjYZCVxT');
var async = require('async');
var User = require('../models/user');

// creating bridge between DB and Elasticsearch replica set
Product.createMapping(function(err, mapping){
	if(err) {
		console.log('Error creating mapping');
		console.log(err);
	} else {
		console.log("Mapping created");
		console.log(mapping);
	}
});

var stream = Product.synchronize();
var count = 0;

function paginate(req, res, next){
	var perPage = 9; // number of items per page
	var page = req.params.page === 'undefined' ? 1 : req.params.page;

	Product
		.find()
		.skip(perPage * (page - 1))
		.limit(perPage)
		.populate('category')
		.exec(function(err, products){
			if(err) return next();

			Product.count(function(err, count){
				if(err) return next();
				var pages = count / perPage;
				if(count % perPage !== 0){
					pages++;
				} 

				res.render('main/product-main', {
					products: products,
					pages: pages
				});
			});
		});
}

// count documents
stream.on('data', function(){
	count++;
});

stream.on('close', function(){
	console.log("Indexed " + count + " documents");
});

stream.on('error', function(err){
	console.log(err);
});

router.get('/cart', function(req, res, next){
	Cart
		.findOne({ owner: req.user._id })
		.populate('items.item')
		.exec(function(err, foundCart){
			if(err) return next(err);
			console.log("Found cart: " + foundCart);

			res.render('main/cart', {
				foundCart: foundCart,
				message: req.flash('remove')
			});
		});
});

router.post('/product/:product_id', function(req, res, next){
	Cart.findOne({ owner: req.user._id }, function(err, cart){
		if(err) return next(err);

		cart.items.push({
			item: req.body.product_id,
			quantity: parseInt(req.body.quantity),
			price: parseFloat(req.body.totalPrice)
		});

		cart.total = (cart.total + parseFloat(req.body.totalPrice)).toFixed(2);

		cart.save(function(err, cart){
			if(err) return next(err);
			res.redirect('/cart');
		});
	});
});

router.post('/remove', function(req, res, next){
	Cart.findOne({ owner: req.user._id }, function(err, foundCart){
		// MongooseArray#pull - alias of remove
		foundCart.items.pull(String(req.body.item));

		foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
		foundCart.save(function(err){
			if(err) return next(err);
			req.flash('remove', 'Successfully removed');
			res.redirect('/cart');
		});
	});
});

router.post('/search', function(req, res, next){
	res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res, next){
	if(req.query.q){
		Product.search({
			query_string: { query: req.query.q }
		}, function(err, results){
			if(err) return next(err);
			var data = results.hits.hits.map(function(hit){
				return hit;
			});

			res.render('main/search-result', {
				query: req.query.q,
				data: data
			});
		});
	}
});


router.get('/', function(req, res, next){
	console.log("Req User: " + req.user);
	if(req.user){
		paginate(req, res, next);
	} else {
		res.render('./main/home');
	}
});

router.get('/page/:page', function(req, res, next){
	paginate(req, res, next);
});

router.get('/about', function(req, res){
	res.render('./main/about');
});

// :id - category id, pristupamo mu pomocu req.params.id
router.get('/products/:id', function(req, res, next){
	Product
		.find({ category: req.params.id }) // returns an array of documents
		.populate('category') // popunjavamo podatke za kategoriju svakog proizvoda(name,..)
		.exec(function(err, products){
			if(err) return next(err);

			res.render('main/category', {
			 	products: products
			});
		})
});

router.get('/product/:id', function(req, res, next){
	Product.findById({ _id: req.params.id }, function(err, product){
		if(err) return next(err);
		res.render('main/product', {
			product: product
		});
	});
});

router.post('/payment', function(req, res, next){
	var stripeToken = req.body.stripeToken;
	// currentCharges - total price of cart
	var currentCharges = Math.round(req.body.stripeMoney * 100); // convert to cents

	stripe.customers.create({
		source: stripeToken
	}).then(function(customer){  //promises
		return stripe.charges.create({
			amount: currentCharges,
			currency: 'usd',
			customer: customer.id
		});
	}).then(function(charge){
			async.waterfall([
				function(callback){
					Cart.findOne({ owner: req.user._id}, function(err, cart){
						callback(err, cart);
					});
				},

				function(cart, callback){
					User.findOne({ _id: req.user._id }, function(err, user){
						if(user){
							for(var i = 0; i < cart.items.length; i++){
								user.history.push({
									item: cart.items[i].item,
									paid: cart.items[i].price
								});
							}
						}

						user.save(function(err, user){
							if(err) return next(err);
							callback(err, user);
						});
					});
				},

				function(user){ // cistimo korpu nakon uspesne kupovine
					Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated){
						if(updated){
							res.redirect('/profile');
						}
					});
				}
			]);
	});
});

module.exports = router;