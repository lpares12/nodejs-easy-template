const Stripe = require('stripe');

const productToPriceMap = {
	BASIC: process.env.PRODUCT_BASIC,
}
const priceToProductMap = function(price){
	if(price == process.env.PRODUCT_BASIC){
		return 'BASIC';
	}else{
		throw new Error(price + " not found");
	}
}

const currencyToSymbolMap = function(currency){
	if(currency.toLowerCase() == 'eur'){
		return '€';
	}

	return currency;
}

var StripeHandler = {
	setUp: function(){
		if(process.env.STRIPE_SECRET_KEY == null ||
			process.env.STRIPE_WEBHOOK_SECRET == null){
			throw new Error('You have to set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET');
		}
		this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
	},

	addCustomer: async function(name, email){
		const customer = await this.stripe.customers.create({
			email,
			description: name
		});

		return customer;
	},

	createCheckoutSession: async function(userId, customerId, price){
		const session = await this.stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			customer: customerId,
			line_items: [{price: productToPriceMap[price], quantity: 1}],
			success_url: process.env.APP_PROTOCOL + "://" + process.env.APP_HOST + "/subscription/checkout/success/{CHECKOUT_SESSION_ID}",
			cancel_url: process.env.APP_PROTOCOL + "://" + process.env.APP_HOST + "/subscription/checkoutcancel",
			client_reference_id: userId,
		})

		return session;
	},

	createBillingSession: async function(stripeId){
		const session = await this.stripe.billingPortal.sessions.create({
			customer: stripeId,
			return_url: process.env.APP_PROTOCOL + "://" + process.env.APP_HOST + "/subscription/manage/success",
		})

		return session;
	},

	processEvent: async function(commandData){
		retData = {}

		//TODO: Enable this whenever we fix the issue explained at
		//routes/subscription.js on the webhook.
		/*
		try{
			ev = this.stripe.webhooks.constructEvent(body,
				signature, process.env.STRIPE_WEBHOOK_SECRET);
		}catch(err){
			console.log(err);
			throw new Error('Unable to construct Stripe event');
		}*/

		const ev = commandData
		const data = ev.data.object;

		switch(ev.type){
			case 'customer.created':
				console.log('Stripe customer has been created');
				break;
			case 'customer.deleted':
				console.log('Stripe customer has been deleted');
				break;
			case 'customer.subscription.created':
				console.log('Subscription created');
				retData['type'] = 'subscriptionCreated';
				retData['stripeId'] = data.customer;
				retData['product'] = priceToProductMap(data.plan.id);
				retData['membershipEndDate'] = new Date(data.current_period_end * 1000);
				retData['cancelAtEnd'] = data.cancel_at_period_end;
				retData['active'] = (data.status == 'active');
				break;
			case 'customer.subscription.updated':
				console.log('Subscription updated');
				retData['type'] = 'subscriptionUpdated';
				retData['stripeId'] = data.customer;
				retData['active'] = (data.status == 'active');
				retData['membershipEndDate'] = new Date(data.current_period_end * 1000);
				retData['cancelAtEnd'] = data.cancel_at_period_end;
				retData['product'] = priceToProductMap(data.plan.id);
				break;
			case 'customer.subscription.deleted':
				console.log('Subscription deleted');
				//I believe this is only triggered when removing the
				//subscription manually from Stripe dashboard
				retData['type'] = 'subscriptionDeleted';
				retData['stripeId'] = data.customer;
				retData['product'] = priceToProductMap(data.plan.id);
				break;
			case 'invoice.upcoming':
				console.log('Upcoming invoice');
				//Sent a few days prior to the renewal of the subscription
				retData['type'] = 'invoiceUpcoming';
				retData['stripeId'] = data.customer;
				//NOTE: This is dangerous, since not all currencies will
				//have to be divided by 100 and displayed in 2 decimals!
				retData['total'] = (data.total/100).toFixed(2);
				retData['date'] = new Date(data.next_payment_attempt * 1000);
				retData['currency'] = currencyToSymbolMap(data.currency);
				retData['email'] = data.customer_email;
				break;
			case 'invoice.paid':
				console.log('Invoice paid');
				//To generate an invoice
				retData['type'] = 'invoicePaid';
				retData['stripeId'] = data.customer;
				retData['total'] = (data.total/100).toFixed(2);
				retData['date'] = new Date(data.status_transitions.paid_at * 1000);
				retData['currency'] = currencyToSymbolMap(data.currency);
				retData['email'] = data.customer_email;
				break;
			case 'invoice.payment_failed':
				console.log('Invoice failed');
				//This event will be called whenever we try to update a
				//subscription and the payment failed (expired card or whatever)
				retData['type'] = 'invoiceNotPaid';
				retData['stripeId'] = data.customer;
				retData['total'] = (data.total/100).toFixed(2);
				retData['date'] = new Date(data.status_transitions.finalized_at * 1000);
				retData['currency'] = currencyToSymbolMap(data.currency);
				retData['email'] = data.customer_email;
				break;
			default:
				return null;
		}

		return retData;
	}
}

module.exports = StripeHandler;
