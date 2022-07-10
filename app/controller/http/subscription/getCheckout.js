getCheckout = require('../../../application/subscription/getCheckout.js');
getCheckoutHandler = require('../../../application/subscription/getCheckoutHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = getCheckout(req.user);
		checkoutSession = await getCheckoutHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null, checkoutSession.url);
}
