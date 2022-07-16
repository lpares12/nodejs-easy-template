repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	try{
		user = await repository.get(commandData.userId);
		token = await repository.generateToken(commandData);

		//Send email
		//TODO: Make this as an event and create a command sendPasswordChangeEmail
		//that will be subscribed to those events
		await emailer.sendPasswordChangeEmail(user, token);
	}catch(err){
		throw err;
	}
}
