module.exports = function(userId, host){
	if(!userId || !host){
		return new Error('Invalid user id or host');
	}

	return {
		'userId': userId,
		'host': host,
		'type': 'emailValidation',
	}
}
