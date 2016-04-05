var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

/* The user schema attributes */
var UserSchema = new Schema({
	email: { type: String, unique: true, lowercase: true },
	password: String,
	profile: {
		name: { type: String, default: '' },
		picture: { type: String, default: '' }
	},
	address: String,
	history: [{
		date: Date,
		paid: { type: Number, default: 0 }
	}]
});

/* Hash the password before we even save it to the database */
// Schema#pre(method, callback)
// Defines a pre hook for the document
UserSchema.pre('save', function(next){
	var user = this; // this -> reffers to UserSchema

	// Schema#isModified() - Returns true if this document was modified, else false.
	if(!user.isModified('password')){
		return next();
	}

	bcrypt.genSalt(10, function(err, salt){
		if(err) return next(err);

		// hash(data, salt, progress, cb)
		bcrypt.hash(user.password, salt, null, function(err, hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

/* compare password in the database and the one the the user type in. */
// We create custom method - add keyword methods to Schema name
UserSchema.methods.comparePassword = function(password){
	// compareSync(data, encrypted) - data(data to compare), encrypted(data to be compare to)
	return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function(size){
	if(!this.size) size = 200; 
	// if not email, return random image
	if(!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
	var md5 = crypto.createHash('md5').update(this.email).digest('hex');
	return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro';
}

// To use schema definition, we need to convert UserSchema into a Model we can work with. 
// To do so, we pass it into mongoose.model(modelName, schema):
module.exports = mongoose.model('User', UserSchema);