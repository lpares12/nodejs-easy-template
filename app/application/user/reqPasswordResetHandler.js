repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	try{
		user = await repository.getByNameOrEmail(commandData.username);
		commandData['userId'] = user._id;
		token = await repository.generateToken(commandData);

		//Send email
		//TODO: Make this as an event and create a command sendPasswordChangeEmail
		//that will be subscribed to those events
		emailer.sendPasswordChangeEmail(user, token, commandData.host);
	}catch(err){
		throw err;
	}
}
