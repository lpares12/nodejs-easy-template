repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	const host = commandData['host']
	delete commandData['host']

	try{
		user = await repository.get(commandData.userId);
		token = await repository.generateToken(commandData);

		//Send email
		//TODO: Make this as an event and create a command sendVerificationEmail
		//that will be subscribed to those events
		emailer.sendVerificationEmail(user, token, host);
	}catch(err){
		throw err;
	}
}
