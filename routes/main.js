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

module.exports = router;