const mongoose = require('mongoose');
const crypto = require('crypto');

const TokenSchema = new mongoose.Schema({
	_userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
	token: { type: String, required: true},
	//This field will tell us when the token was created and will remove the token after 3600 seconds (1 hour)
	createdAt: { type: Date, required: true, default: Date.now, expires: 3600},
});

TokenSchema.statics.generateToken = async function(user){
	const newToken = new this({
		_userId: user._id,
		token: crypto.randomBytes(16).toString('hex')
	});
	await newToken.save();
	return newToken;
}

TokenSchema.statics.clearUserTokens = async function(user){
	ret = await Token.deleteMany({_userId : user._id});
}

TokenSchema.statics.validateToken = async function(userId, tokenId){
	ret = await Token.findOneAndDelete({token: tokenId, _userId: userId});
	if(ret == null){
		return false;
	}

	return true;
}

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
