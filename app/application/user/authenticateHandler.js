repository = require('../../infrastructure/user/repository.js');

module.exports = async function(commandData){
	//Call infra
	user = await repository.authenticate(commandData);

	return user;
}
