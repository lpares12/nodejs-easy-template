processWebhook = require('../../../application/subscription/processWebhook.js');
processWebhookHandler = require('../../../application/subscription/processWebhookHandler.js');

module.exports.execute = async function(data, callback){
	//Execute command
	try{
		//const command = processWebhook(req.body, req.headers['stripe-signature']);
		await processWebhookHandler(data);
	}catch(err){
		console.log(err);
		return callback(err);
	}

	return callback(null);
}
