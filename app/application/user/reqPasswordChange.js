module.exports = function(userId){
	if(!userId){
		throw new Error('UserId can not be empty');
	}

	return {
		'userId': userId,
		'type': 'passwordReset',
	}
}
