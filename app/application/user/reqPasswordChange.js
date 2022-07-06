module.exports = function(userId, host){
	if(!userId || !host){
		throw new Error('UserId and host can not be empty');
	}

	return {
		'userId': userId,
		'host': host,
		'type': 'passwordReset',
	}
}
