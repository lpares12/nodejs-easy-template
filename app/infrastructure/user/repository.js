User = require('../../domain/user/model/user.js');
Token = require('../../domain/user/model/token.js');

module.exports.save = async function(userData){
	return await User.create(userData);
}

module.exports.get = async function(userId){
	return await User.findById(userId).orFail(new Error('Unauthorized'));
}

module.exports.getByNameOrEmail = async function(username){
	return await User.findOne().or([{username: username}, {email: username}]).orFail(new Error('Unauthorized'));
}

module.exports.getByStripeId = async function(stripeId){
	return await User.findOne({stripeId: stripeId}).orFail(new Error('Unable to retrieve user with stripe id: ' + stripeId));
}

module.exports.authenticate = async function(userData){
	user = await User.authenticate(userData.username, userData.password);
	user.lastLogin = new Date();
	//Do not validate, the password validation will fail since the hash
	//is longer than the allowed password size
	user = await user.save({ validateBeforeSave: false });

	return user;
}

module.exports.setIsVerified = async function(userId){
	//NOTE: This will return the old document! For some reason setting {new: True}
	//is ignored
	return await User.findByIdAndUpdate(userId, {isVerified: true}).orFail(new Error('User not found'));
}

module.exports.updatePassword = async function(userData){
	if(!userData.pass){
		throw new Error('Password can not be empty');
	}

	return await User.findByIdAndUpdate(userData.userId, {password: userData.pass}).orFail(new Error('User not found'));
}

module.exports.setStripeId = async function(userId, stripeId){
	if(!stripeId){
		throw new Error('StripeId can not be undefined');
	}
	return await User.findByIdAndUpdate(userId, {stripeId: stripeId}).orFail(new Error('User not found'));
}

module.exports.generateToken = async function(tokenData){
	await Token.clearUserTokens(tokenData.userId);
	return await Token.generateToken(tokenData.userId, tokenData.type);
}

module.exports.checkToken = async function(tokenData){
	await Token.checkToken(tokenData.userId, tokenData.token, tokenData.type);
}

module.exports.validateToken = async function(tokenData){
	await Token.validateToken(tokenData.userId, tokenData.token, tokenData.type);
}

module.exports.setSubscription = async function(stripeId, product, endDate, cancelled){
	return await User.findOneAndUpdate({stripeId: stripeId},
		{plan: product.toLowerCase(), subscriptionEndDate: endDate, membershipCancelled: cancelled}, {runValidators: true}).orFail(new Error('StripeId not found'));
}

module.exports.removeSubscription = async function(stripeId, plan){
	return await User.findOneAndUpdate({stripeId, stripeId, plan: plan.toLowerCase()},
		{plan: 'none', membershipCancelled: false}, {runValidators: true}).orFail(new Error('User with this plan not found'));
}
