'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositorySetStripeId', () => {
	it('Can be set', async() => {
		var doc = await userRepo.save(createData);
		expect(doc.stripeId).toBe(null);

		await expect(userRepo.setStripeId(doc._id, stripeId)).resolves.not.toThrow()

		doc = await userModel.findById(doc._id).orFail(new Error("Test error user does not exist"));
		expect(doc.stripeId).toEqual(stripeId);
	});

	it('User does not exist', async() => {
		await expect(userRepo.setStripeId("41224d776a326fb40f000001", stripeId)).rejects.toThrow("User not found");
	});

	it('Empty value', async() => {
		var doc = await userRepo.save(createData);

		await expect(userRepo.setStripeId(doc._id)).rejects.toThrow();
	});
});

var trialEnd = new Date();
trialEnd.setDate(trialEnd.getDate() + parseInt(process.env.TRIAL_DAYS));

const createData = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
	'subscriptionEndDate': trialEnd, 
};

const stripeId = 'cus_whatever1212';
