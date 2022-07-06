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

module.exports.authenticate = async function(userData){
	return await User.authenticate(userData.username, userData.password);
}

module.exports.setIsVerified = async function(userId){
	return await User.findByIdAndUpdate(userId, {isVerified: true});
}

module.exports.updatePassword = async function(userData){
	return await User.findByIdAndUpdate(userData.userId, {password: userData.pass});
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
