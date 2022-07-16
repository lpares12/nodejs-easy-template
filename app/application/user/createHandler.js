repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	//Call infra
	user = await repository.save(commandData);

	try{
		token = await repository.generateToken({userId: user._id, type: 'emailValidation'});

		//Send email
		//TODO: Make this as an event and create a command sendVerificationEmail
		//that will be subscribed to those events
		emailer.sendVerificationEmail(user, token);
	}catch(err){
		//Fail silently, we do not care
		console.log(err);
	}

	return user;
}
