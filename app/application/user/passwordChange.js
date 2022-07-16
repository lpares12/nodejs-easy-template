module.exports = function(userId, token, pass, pass2){
	if(!userId || !token || !pass || !pass2){
		throw new Error('User, token and pass cannot be empty');
	}

	if(pass != pass2){
		throw new Error('Passwords must match');
	}

	return {
		'userId': userId,
		'token': token,
		'pass': pass,
		'type': 'passwordReset',
	}
}
