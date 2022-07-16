module.exports = function(username){
	if(!username){
		throw new Error('Username can not be empty');
	}

	return {
		'username': username,
		'type': 'passwordReset',
	}
}
