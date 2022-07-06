authenticate = require('../../../application/user/authenticate.js');
authenticateHandler = require('../../../application/user/authenticateHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = authenticate(req.body.user, req.body.pass);
		user = await authenticateHandler(command);

		req.session.userId = user._id;
	}catch(err){
		return callback(err);
	}

	return callback();
}
