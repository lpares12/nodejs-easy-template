repository = require('../../infrastructure/user/repository.js');

module.exports = async function(commandData){
	try{
		user = await repository.get(commandData.userId);
		await repository.checkToken(commandData);
	}catch(err){
		throw err;
	}

	return user;
}
