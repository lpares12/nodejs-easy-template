module.exports = function(user){
	if(!user || !user.stripeId || !user._id){
		throw new Error('User must have a valid ID and Stripe client ID');
	}

	return {
		'userId': user._id,
		'stripeId': user.stripeId,
		'price': 'BASIC',
	}
}
