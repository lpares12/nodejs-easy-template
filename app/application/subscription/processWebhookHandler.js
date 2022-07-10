repository = require('../../infrastructure/user/repository.js');
stripe = require('../../infrastructure/utils/stripe.js');
emailer = require('../../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	try{
		const eventData = await stripe.processEvent(commandData);

		if(eventData){
			console.log(eventData);
			switch(eventData.type){
				case 'subscriptionCreated':
					if(eventData['active']){
						await repository.setSubscription(eventData['stripeId'], eventData['product'], eventData['membershipEndDate'], eventData['cancelAtEnd']);
					}
					break;
				case 'subscriptionUpdated':
					if(eventData['active']){
						await repository.setSubscription(eventData['stripeId'], eventData['product'], eventData['membershipEndDate'], eventData['cancelAtEnd']);
					}else{
						await repository.removeSubscription(eventData['stripeId'], eventData['product']);
					}
					break;
				case 'subscriptionDeleted':
					await repository.removeSubscription(eventData['stripeId'], eventData['product']);
					break;
				case 'invoiceUpcoming':
					user = await repository.getByStripeId(eventData['stripeId']);
					emailer.sendUpcomingInvoice(user.username, user.email, eventData);
					break;
				case 'invoicePaid':
					user = await repository.getByStripeId(eventData['stripeId']);
					emailer.sendInvoice(user.username, user.email, eventData);
					break;
				case 'invoiceNotPaid':
					user = await repository.getByStripeId(eventData['stripeId']);
					emailer.sendInvoiceNotPaid(user.username, user.email, eventData);
					break;
			}
		}
	}catch(err){
		throw err;
	}
}
