const User = require('../../models/user.js');
const Token = require('../../models/token.js');

module.exports.authenticateUser = function(username, pass, callback){
	User.authenticate(username, pass, function(err, user){
		if(err){
			return callback(err);
		}

		try{
			user.lastLogin = new Date();
			//NOTE: We are gonna avoid validation when updating the user
			//because the validation for password will always fail, since
			//the password is now salted and hashed.
			//TODO: Explore if it is better to hardcode this validation
			//in the registration procedure, instead of in the model,
			//so we don't have to disable validation every time we update
			//the user.
			user.save({ validateBeforeSave: false });
		}catch(err){
			return callback(err);
		}

		return callback(null, user);
	});
}

module.exports.createUser = function(userData, callback){
	//Check passwords are matching
	if(userData['password'] != userData['password2']){
		var err = new Error('Passwords must match');
		err.status = 400;
		return callback(err);
	}

	User.create(userData, function(err, user){
		if(err){
			return callback(err);
		}else{
			return callback(null, user);
		}
	});
}

module.exports.modifyPassword = function(user, password, password2, callback){
	//Check passwords are matching
	if(password != password2){
		var err = new Error('Passwords must match');
		err.status = 400;
		return callback(err);
	}

	user.password = password;
	//Allow validation of password field
	try{
		user.save();
	}catch(err){
		return callback(err);
	}

	return callback(null, user);
}

module.exports.getUser = function(userId, callback){
	User.findById(userId).exec(function(err, user){
		if(err){
			return callback(err);
		}else{
			if(user == null){
				var err = new Error('User not found');
				err.status = 404;
				return callback(err);
			}else{
				return callback(null, user);
			}
		}
	});
}

module.exports.deleteUser = function(userId, callback){
	User.findByIdAndRemove(userId).exec(function(err, user){
		if(err){
			return callback(error);
		}

		if(!user){
			var err = new Error('User not found');
			err.status = 400;
			return callback(err);
		}else{
			return callback(err, user);
		}
	});
}

module.exports.generateToken = function(userId, type, callback){
	module.exports.getUser(userId, async function(err, user){
		if(err){
			return callback(err);
		}

		if(!user){
			var err = new Error('User not found');
			err.status = 400;
			return callback(err);
		}

		try{
			await Token.clearUserTokens(user);
		}catch(err){
			return callback(err);
		}

		try{
			const token = await Token.generateToken(user, type);
			return callback(null, user, token);
		}catch(err){
			return callback(err);
		}
	});
}

module.exports.validateToken = function(userId, tokenId, type, callback){
	module.exports.getUser(userId, function(err, user){
		if(err){
			return callback(err);
		}

		Token.validateToken(user._id, tokenId, type, function(err, token){
			if(err){
				return callback(err);
			}

			if(token.type === 'emailValidation'){
				user.isVerified = true;
				user.save({ validateBeforeSave: false });
			}

			return callback(null, user);
		});
	});
}

module.exports.checkToken = function(userId, tokenId, type, callback){
	module.exports.getUser(userId, async function(err, user){
		if(err){
			return callback(err);
		}

		Token.checkToken(userId, tokenId, type, function(err, token){
			if(err){
				return callback(err);
			}

			return callback(null, user, token);
		});
	});
}

module.exports.resetPassword = function(username, callback){
	User.findOne().or([{username: username}, {email: username}])
	.exec(async function(err, user){
		if(err){
			return callback(err);
		}else if(!user){
			var err = new Error('User does not exist');
			err.status = 404;
			return callback(err);
		}

		//TODO: This code is a bit repeated with generateToken
		try{
			await Token.clearUserTokens(user);
		}catch(err){
			return callback(err);
		}

		try{
			const token = await Token.generateToken(user, "passwordReset");
			return callback(null, user, token);
		}catch(err){
			return callback(err);
		}
	});
}
