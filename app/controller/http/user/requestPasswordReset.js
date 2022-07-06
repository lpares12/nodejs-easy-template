reqPasswordReset = require('../../../application/user/reqPasswordReset.js');
reqPasswordResetHandler = require('../../../application/user/reqPasswordResetHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = reqPasswordReset(req.body.username, req.headers.host);
		await reqPasswordResetHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null);
}
