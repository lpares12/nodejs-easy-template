repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	const host = commandData['host'];
	delete commandData['host'];

	try{
		await repository.validateToken(commandData);

		user = await repository.setIsVerified(commandData.userId);

		//Send email, TODO: move to an event
		emailer.sendVerifiedEmail(user, host);
	}catch(err){
		throw err;
	}

	return user;
}
