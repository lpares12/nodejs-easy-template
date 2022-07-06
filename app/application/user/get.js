module.exports = function(userId){
	if(userId == null){
		throw new Error('UserId must be valid');
	}

	return userId;
}
