'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositorySetSubscription', () => {
	it('Can be set', async() => {
		const user = await userRepo.save(createData);
		await userRepo.setStripeId(user._id, stripeId);

		await expect(userRepo.setSubscription(subscriptionData.stripeId,
					subscriptionData.product,
					subscriptionData.endDate,
					subscriptionData.cancelled)).resolves.not.toThrow();

		const newUser = await userModel.findById(user._id);
		expect(newUser.stripeId).toEqual(subscriptionData.stripeId);
		expect(newUser.plan).toEqual(subscriptionData.product.toLowerCase());
		expect(newUser.endDate).toEqual(subscriptionData.subscriptionEndDate);
		expect(newUser.membershipCancelled).toEqual(subscriptionData.cancelled);
	});

	it('Can be set with cancellation at end', async() => {
		const user = await userRepo.save(createData);
		await userRepo.setStripeId(user._id, stripeId);

		await expect(userRepo.setSubscription(subscriptionData.stripeId,
					subscriptionData.product,
					subscriptionData.endDate,
					true)).resolves.not.toThrow();

		const newUser = await userModel.findById(user._id);
		expect(newUser.stripeId).toEqual(subscriptionData.stripeId);
		expect(newUser.plan).toEqual(subscriptionData.product.toLowerCase());
		expect(newUser.endDate).toEqual(subscriptionData.subscriptionEndDate);
		expect(newUser.membershipCancelled).toEqual(true);
	});

	it('User does not exist', async() => {
		await expect(userRepo.setSubscription(subscriptionData.stripeId,
				subscriptionData.product,
				subscriptionData.endDate,
				subscriptionData.cancelled)).rejects.toThrow("StripeId not found");
	});

	it('Product does not exist', async() => {
		const user = await userRepo.save(createData);
		await userRepo.setStripeId(user._id, stripeId);

		await expect(userRepo.setSubscription(subscriptionData.stripeId,
					"hello",
					subscriptionData.endDate,
					subscriptionData.cancelled))
			.rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.setSubscription(subscriptionData.stripeId,
					"hello",
					subscriptionData.endDate,
					subscriptionData.cancelled))
			.rejects.toThrow("Validation failed: plan: `hello` is not a valid enum value for path `plan`.");
	});

	/*
	it('Invalid end date', async() => {
		const user = await userRepo.save(createData);
		await userRepo.setStripeId(user._id, stripeId);

		//TODO: This test is failing because end date string is being transformed
		//to a date object with a weird value. Fix this!
		await(userRepo.setSubscription(subscriptionData.stripeId,
					subscriptionData.product,
					"1494",
					subscriptionData.cancelled))
			.rejects.toThrow(mongoose.Error.ValidationError);
	});*/
});

var trialEnd = new Date();
var subscriptionEnd = new Date();
trialEnd.setDate(trialEnd.getDate() + parseInt(process.env.TRIAL_DAYS));
subscriptionEnd.setDate(subscriptionEnd.getDate() + parseInt(process.env.TRIAL_DAYS)*2);

const stripeId = 'cus_whatever1212';

const createData = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
	'subscriptionEndDate': trialEnd, 
};

const subscriptionData = {
	'stripeId': stripeId,
	'product': 'BASIC',
	'endDate': subscriptionEnd,
	'cancelled': false,
};
