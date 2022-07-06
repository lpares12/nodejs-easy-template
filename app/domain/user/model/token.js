const mongoose = require('mongoose');
const crypto = require('crypto');

const TokenSchema = new mongoose.Schema({
	_userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
	token: { type: String, required: true},
	//This field will tell us when the token was created and will remove the token after 3600 seconds (1 hour)
	createdAt: { type: Date, required: true, default: Date.now, expires: 3600},
	type: { type: String, enum: ['emailValidation', 'passwordReset'], required: true },
});

TokenSchema.pre('save', function(next){
	var token = this;

	//Note: no salting is needed since we can assume that token texts will be unique
	const hash = crypto.createHash('sha256').update(token.token).digest('base64');
	token.token = hash;
	next();
})

TokenSchema.statics.generateToken = async function(user, type){
	const tokenSecret = crypto.randomBytes(16).toString('hex');
	const newToken = new this({
		_userId: user._id,
		token: tokenSecret,
		type: type,
	});

	await newToken.save();

	//The function `pre-save` hashes the token, so we need to make
	//sure that we are returning here the non-hashed token.
	newToken.token = tokenSecret;
	return newToken;
}

TokenSchema.statics.clearUserTokens = async function(user){
	await Token.deleteMany({_userId : user._id});
}

TokenSchema.statics.validateToken = async function(userId, tokenSecret, type){
	const hash = crypto.createHash('sha256').update(tokenSecret).digest('base64');
	token = await Token.findOneAndDelete({token: hash, _userId: userId, type: type});
	if(!token){
		throw new Error('Token not found or expired');
	}
}

TokenSchema.statics.checkToken = async function(userId, tokenSecret, type){
	const hash = crypto.createHash('sha256').update(tokenSecret).digest('base64');
	token = await Token.findOne({token: hash, _userId: userId, type: type});
	if(!token){
		throw new Error('Token not found or expired');
	}

	return token;
}

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
