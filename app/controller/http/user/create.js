create = require('../../../application/user/create.js');
createHandler = require('../../../application/user/createHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = create(req.body.user, req.body.email, req.body.pass, req.body.pass2, req.headers.host);
		user = await createHandler(command);

		//Set the session
		req.session.userId = user._id;
	}catch(err){
		return callback(err);
	}

	return callback(null, user);
}
