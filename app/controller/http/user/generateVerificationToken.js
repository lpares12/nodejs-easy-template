generateToken = require('../../../application/user/generateToken.js');
generateTokenHandler = require('../../../application/user/generateTokenHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = generateToken(req.session.userId, req.headers.host);
		await generateTokenHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null);
}
