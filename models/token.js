const mongoose = require('mongoose');
const crypto = require('crypto');

const TokenSchema = new mongoose.Schema({
	_userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
	token: { type: String, required: true},
	//This field will tell us when the token was created and will remove the token after 3600 seconds (1 hour)
	createdAt: { type: Date, required: true, default: Date.now, expires: 3600},
	type: { type: String, enum: ['emailValidation', 'passwordReset'], required: true },
});

TokenSchema.statics.generateToken = async function(user, type){
	const newToken = new this({
		_userId: user._id,
		token: crypto.randomBytes(16).toString('hex'),
		type: type,
	});
	await newToken.save();
	return newToken;
}

TokenSchema.statics.clearUserTokens = async function(user){
	ret = await Token.deleteMany({_userId : user._id});
}

TokenSchema.statics.validateToken = function(userId, tokenId, type, callback){
	Token.findOneAndDelete({token: tokenId, _userId: userId, type: type})
	.exec(function(err, token){
		if(err){
			return callback(err);
		}

		if(!token){
			var err = new Error('Invalid token');
			err.status = 404;
			return callback(err);
		}

		return callback(null, token);
	});
}

TokenSchema.statics.checkToken = function(userId, tokenId, type, callback){
	Token.findOne({token: tokenId, _userId: userId, type: type}).exec(function(err, token){
		if(err){
			return callback(err);
		}

		if(!token){
			var err = new Error('Invalid token');
			err.status = 404;
			return callback(err);
		}

		return callback(null, token);
	});
}

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
