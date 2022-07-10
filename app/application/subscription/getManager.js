module.exports = function(user){
	if(!user || !user.stripeId){
		throw new Error('User must have a valid ID and Stripe client ID');
	}

	return user.stripeId;
}
