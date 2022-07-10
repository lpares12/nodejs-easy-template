repository = require('../../infrastructure/user/repository.js');
emailer = require('../../infrastructure/utils/emailer.js');
stripe = require('../../infrastructure/utils/stripe.js');

module.exports = async function(commandData){
	const host = commandData['host'];
	delete commandData['host'];

	try{
		await repository.validateToken(commandData);

		user = await repository.setIsVerified(commandData.userId);

		//TODO: move this to another command and send an event to it
		customer = await stripe.addCustomer(user.username, user.email);
		await repository.setStripeId(user._id, customer.id);

		//Send email, TODO: move to an event
		emailer.sendVerifiedEmail(user, host);
	}catch(err){
		throw err;
	}

	return user;
}
