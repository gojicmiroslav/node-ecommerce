var router = require('express').Router();
var Product = require('../models/product');

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


router.get('/', function(req, res){
	res.render('./main/home');
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

module.exports = router;