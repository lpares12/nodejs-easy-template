module.exports = function(name, email, subject, message){
	if(!name || !email || !subject || !message){
		throw new Error('Please fill in all the fields');
	}

	return {
		'name': name,
		'email': email,
		'subject': subject,
		'message': message,
	}
}
