function requiresUnsubscribed(req, res, next) {
	if(req.user){
		if(req.user.plan == 'none'){
			return next();
		}else{
			return res.status(401).send('Only unsubscribed users can see this page')
		}
	}else{
		return res.redirect('/');
	}
}

module.exports = requiresUnsubscribed;
