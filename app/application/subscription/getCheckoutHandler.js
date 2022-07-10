stripe = require('../../infrastructure/utils/stripe.js');

module.exports = async function(commandData){
	try{
		checkoutSession = await stripe.createCheckoutSession(commandData.userId,
								commandData.stripeId,
								commandData.price);
		return checkoutSession;
	}catch(err){
		throw err;
	}
}
