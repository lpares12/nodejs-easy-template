function requiresSubscription(req, res, next) {
	if(req.user){
		var currentDate = new Date();
		if(currentDate < req.user.subscriptionEndDate){
			return next();
		}else{
			res.status(401).send('Only users with active subscriptions can see this page')
		}
	}else{
		return res.redirect('/');
	}
}

module.exports = requiresSubscription;
