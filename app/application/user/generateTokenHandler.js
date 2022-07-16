repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	try{
		user = await repository.get(commandData.userId);
		token = await repository.generateToken(commandData);

		//Send email
		//TODO: Make this as an event and create a command sendVerificationEmail
		//that will be subscribed to those events
		emailer.sendVerificationEmail(user, token);
	}catch(err){
		throw err;
	}
}
