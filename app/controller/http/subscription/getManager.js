getManager = require('../../../application/subscription/getManager.js');
getManagerHandler = require('../../../application/subscription/getManagerHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = getManager(req.user);
		billingManager = await getManagerHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null, billingManager.url);
}
