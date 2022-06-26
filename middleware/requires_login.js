const User = require('../models/user.js');

function requiresLogin(req, res, next) {
	if(req.session && req.session.userId){
		User.findById(req.session.userId).exec(function(err, user){
			if(err || !user){
				var error = new Error('Not authorized');
				error.status = 400;
				return next(error);
			}

			if(user.isVerified){
				return next();
			}else{
				return res.redirect('/user/profile');
			}
		});
	}else{
		return res.redirect('/');
	}
}

module.exports = requiresLogin;
