contact = require('../../application/contact.js');
contactHandler = require('../../application/contactHandler.js');

module.exports.execute = async function(req, callback){
	//Execute command
	try{
		const command = contact(req.body.name, req.body.email, req.body.subject, req.body.message);
		await contactHandler(command);
	}catch(err){
		return callback(err);
	}

	return callback(null);
}
