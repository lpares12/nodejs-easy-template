get = require('../../../application/user/get.js');
getHandler = require('../../../application/user/getHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = get(req.session.userId);
		user = await getHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null, user);
}
