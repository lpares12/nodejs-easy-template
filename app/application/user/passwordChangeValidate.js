module.exports = function(userId, token){
	if(!userId || !token){
		return new Error('Invalid user or token');
	}

	return {
		'userId': userId,
		'token': token,
		'type': 'passwordReset',
	}
}
