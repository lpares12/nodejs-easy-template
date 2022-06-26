function redirectOnLogin(req, res, next) {
	if(req.session && req.session.userId){
		res.redirect('/user/profile');
	}else{
		return next();
	}
}

module.exports = redirectOnLogin;
