const express = require('express');
var router = express.Router();

const checkout = require('../app/controller/http/subscription/getCheckout.js');
const manage = require('../app/controller/http/subscription/getManager.js');
const processWebhook = require('../app/controller/http/subscription/processWebhook.js');

const setUser = require('../middleware/set_user.js');
const requiresVerified = require('../middleware/requires_verified.js');
const requiresUnsubscribed = require('../middleware/requires_unsubscribed.js');

router.get('/checkout', [setUser, requiresVerified, requiresUnsubscribed], (req, res, next) => {
	checkout.execute(req, async function(err, url){
		if(err){
			return next(err);
		}

		return res.redirect(url);
	});
})

router.get('/checkout/success/:sessionId',
	[setUser, requiresVerified], (req, res, next) => {
	return res.render('subscription/success');
})

router.get('/checkout/cancel',
	[setUser, requiresVerified], (req, res, next) => {
	return res.send('There was an error during checkout!');
})

router.get('/manage',
	[setUser, requiresVerified], (req, res, next) => {
	manage.execute(req, async function(err, url){
		if(err){
			return next(err);
		}

		return res.redirect(url);
	});
})

router.get('/manage/success',
	[setUser, requiresVerified], (req, res, next) => {
	return res.render('subscription/manage_success');
})

//NOTE: We can't send the signature and the req.body through the controller and commands
//because stripe library waits for a RAW element, and something (probably the application
//command) is converting it into non-RAW. Don't wanna lose time right now, but needs fixing
//Workaround for now is to send the stripe event to the command instead of the request.
//TODO: Fix this and put the constructEvent function inside the stripe library in the
//infrastructure folder.
//
//Example from stripe at:
//https://github.com/stripe/stripe-node/blob/master/examples/webhook-signing/node-express/express.js
router.post('/stripe/webhook', express.raw({type: 'application/json'}), (req, res, next) => {
	const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

	try{
		evData = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);

		processWebhook.execute(evData, async function(err){
			if(err){
				console.log(err);
				return res.sendStatus(400);
			}

			return res.sendStatus(200);
		});
	}catch(err){
		console.log(err);
		return res.sendStatus(400);
	}
})

module.exports = router;
