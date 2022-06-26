const User = require('../models/user.js');

function requiresSession(req, res, next) {
	if(req.session && req.session.userId){
		return next();
	}else{
		return res.redirect('/');
	}
}

module.exports = requiresSession;
