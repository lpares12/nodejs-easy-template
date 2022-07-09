repository = require('../app/infrastructure/user/repository.js');

async function setUser(req, res, next){
	if(req.session && req.session.userId){
		user = await repository.get(req.session.userId);

		req.user = user;
		return next();
	}

	return res.redirect('/')
}

module.exports = setUser;
