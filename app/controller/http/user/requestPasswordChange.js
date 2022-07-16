reqPasswordChange = require('../../../application/user/reqPasswordChange.js');
reqPasswordChangeHandler = require('../../../application/user/reqPasswordChangeHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = reqPasswordChange(req.session.userId);
		await reqPasswordChangeHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null);
}
