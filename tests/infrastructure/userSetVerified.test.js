'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositoryVerify', () => {
	it('Verify user', async() => {
		const doc = await userRepo.save(createData);

		var user = await userRepo.setIsVerified(doc._id);

		expect(user.username).toEqual(doc.username);
		expect(user.email).toEqual(doc.email);
		//expect(user.isVerified).toEqual(true);

		user = await userRepo.get(doc._id);
		expect(user.isVerified).toEqual(true);
	});

	it('Verify unexisting user', async() => {
		await expect(userRepo.save(createData)).resolves.not.toThrow();

		await expect(userRepo.setIsVerified("41224d776a326fb40f000001")).rejects.toThrow('User not found');
	});

	it('Invalid input', async() => {
		await expect(userRepo.save(createData)).resolves.not.toThrow();

		await expect(userRepo.setIsVerified()).rejects.toThrow("User not found");
		await expect(userRepo.setIsVerified({})).rejects.toThrow("Cast to ObjectId failed for value \"{}\" (type Object) at path \"_id\" for model \"User\"");
		await expect(userRepo.setIsVerified("0001")).rejects.toThrow("Cast to ObjectId failed for value \"0001\" (type string) at path \"_id\" for model \"User\"");
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
