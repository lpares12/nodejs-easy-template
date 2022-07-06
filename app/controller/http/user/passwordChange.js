passwordChange = require('../../../application/user/passwordChange.js');
passwordChangeHandler = require('../../../application/user/passwordChangeHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = passwordChange(req.params.userId, req.params.token, req.body.pass, req.body.pass2, req.headers.host);
		user = await passwordChangeHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null, user);
}
