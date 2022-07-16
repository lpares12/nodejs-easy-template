module.exports = function(userId, token){
	if(!userId || !token){
		throw new Error('User and token must be filled');
	}

	return {
		'userId': userId,
		'token': token,
		'type': 'emailValidation',
	}
}
