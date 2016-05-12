var Cart = require('../models/cart');

module.exports = function(req, res, next){
	if(req.user){
		var total = 0;

		Cart.findOne({ owner: req.user._id }, function(err, cart){
			if(err) return next(err);

			if(cart){
				cart.items.forEach(function(item){
					// counting 
					total += item.quantity;
				});

				res.locals.cart = total;
			} else {
				res.local.cart = 0;
			}

			next();
		});

	} else {
		next();
	}
}