module.exports = function(userId, token, host){
	if(!userId || !token || !host){
		throw new Error('User, token and host must be filled');
	}

	return {
		'userId': userId,
		'token': token,
		'host': host,
		'type': 'emailValidation',
	}
}
