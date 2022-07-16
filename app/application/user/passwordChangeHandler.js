repository = require('../../infrastructure/user/repository.js');

module.exports = async function(commandData){
	try{
		await repository.validateToken(commandData);
		user = await repository.updatePassword(commandData);

		//Send email
		//TODO: Make this as an event and create a command sendPasswordChangedEmail
		//that will be subscribed to those events
		emailer.sendPasswordChangedEmail(user);
	}catch(err){
		throw err;
	}

	return user;
}
