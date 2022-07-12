'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositoryChangePassword', () => {
	it('Change password', async() => {
		var doc = await userRepo.save(createData);
		doc = await userModel.findById(doc._id).select('+password').orFail(new Error("Test error user does not exist"));

		await expect(userRepo.updatePassword({userId: doc._id, pass: "MyTestPassword2+"})).resolves.not.toThrow();

		const user = await userModel.findById(doc._id).select('+password').orFail(new Error("Test error user doesnot exist"));
		expect(user.password).not.toEqual(doc.password);
	});

	it('Invalid password', async() => {
		var doc = await userRepo.save(createData);
		doc = await userModel.findById(doc._id).select('+password').orFail(new Error("Test error user does not exist"));

		await expect(userRepo.updatePassword({userId: doc._id, pass: "invalidpass"})).rejects.toThrow("Validation failed: password: should have alphanumeric values, a capital and non-capital letter and a special character");
		await expect(userRepo.updatePassword({userId: doc._id, pass: "thisisAlongPassword+01234567890123456789"})).rejects.toThrow("Validation failed: password: length should be between 6 and 30 characters");

		var doc2 = await userModel.findById(doc._id).select('+password').orFail(new Error("Test error user does not exist"));
		expect(doc2.password).toEqual(doc.password);
	});

	it('Empty password', async() => {
		var doc = await userRepo.save(createData);
		doc = await userModel.findById(doc._id).select('+password').orFail(new Error("Test error user does not exist"));

		await expect(userRepo.updatePassword({userId: doc._id})).rejects.toThrow("Password can not be empty");

		var doc2 = await userModel.findById(doc._id).select('+password').orFail(new Error("Test error user does not exist"));
		expect(doc2.password).toEqual(doc.password);
	});

	it('Change password and authenticate', async() => {
		const doc = await userRepo.save(createData);

		await expect(userRepo.updatePassword({userId: doc._id, pass: "MyTestPassword2+"})).resolves.not.toThrow();

		const user = await userRepo.authenticate(loginData);
		expect(user._id).toEqual(doc._id);
		expect(user.lastLogin).not.toEqual(doc.lastLogin);
		expect(user.password).toEqual(null);
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

const loginData = {
	'username': 'tester',
	'password': 'MyTestPassword2+',
}
