module.exports = function(userId){
	if(!userId){
		return new Error('Invalid user id');
	}

	return {
		'userId': userId,
		'type': 'emailValidation',
	}
}
