module.exports = function(username, email, password1, password2, host){
	//TODO: Make sure none of the values are null
	if(password1 != password2){
		throw new Error('Passwords must match');
	}

	//Add days of trial
	var trialEndDate = new Date();
	trialEndDate.setDate(trialEndDate.getDate() + parseInt(process.env.TRIAL_DAYS));

	return {
		'username': username,
		'email': email,
		'password': password1,
		'host': host,
		'subscriptionEndDate': trialEndDate,
	}
}
