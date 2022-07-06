module.exports = function(userId, token, pass, pass2, host){
	if(!userId || !token || !pass || !pass2 || !host){
		throw new Error('User, token pass and host cannot be empty');
	}

	if(pass != pass2){
		throw new Error('Passwords must match');
	}

	return {
		'userId': userId,
		'token': token,
		'pass': pass,
		'type': 'passwordReset',
		'host': host,
	}
}
