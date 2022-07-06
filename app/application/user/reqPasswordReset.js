module.exports = function(username, host){
	if(!username || !host){
		throw new Error('Username and host can not be empty');
	}

	return {
		'username': username,
		'host': host,
		'type': 'passwordReset',
	}
}
