'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRemoveSubscription', () => {
	it('Can be removed', async () => {
		const doc = await userModel.create(createData);

		await expect(userRepo.removeSubscription(createData.stripeId, createData.plan)).resolves.not.toThrow();
		const user = await userModel.findById(doc._id);
		expect(user.plan).toEqual('none');
		expect(user.membershipCancelled).toEqual(false);
	});

	it('Unexisting user', async () => {
		await expect(userRepo.removeSubscription(stripeId2, createData.plan)).rejects.toThrow('User with this plan not found');
	});

	it('Wrong plan', async () => {
		const doc = await userModel.create(createData);

		await expect(userRepo.removeSubscription(stripeId2, 'none')).rejects.toThrow('User with this plan not found');
	});

	it('Invalid plan', async () => {
		const doc = await userModel.create(createData);

		//TODO: Check if we can receive a validator error somehow better here, instead of a search for a non existing plan
		await expect(userRepo.removeSubscription(createData.stripeId, 'hello')).rejects.toThrow('User with this plan not found');
	});
});

var subscriptionEnd = new Date();
subscriptionEnd.setDate(subscriptionEnd.getDate() + parseInt(process.env.TRIAL_DAYS)*2);

const stripeId = 'cus_whatever1212';
const stripeId2 = 'cus_whatever1213';

const createData = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
	'subscriptionEndDate': subscriptionEnd,
	'stripeId': stripeId,
	'plan': 'basic',
};
