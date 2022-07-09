async function requiresVerified(req, res, next){
	if(req.user.isVerified){
		return next();
	}

	return res.redirect('/user/profile')
}

module.exports = requiresVerified;
