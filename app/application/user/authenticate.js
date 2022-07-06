module.exports = function(username, password){
	if(!username || !password){
		throw new Error('Fill in username and password');
	}

	return {
		'username': username,
		'password': password,
	}
}
