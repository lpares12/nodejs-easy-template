'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositoryGet', () => {
	it('Get existing user by Id', async() => {
		const doc = await userRepo.save(createData);

		const user = await userRepo.get(doc._id);
		expect(user._id).toEqual(doc._id);
		expect(user.username).toEqual(doc.username);
		expect(user.email).toEqual(doc.email);
		expect(user.registrationDate).toEqual(doc.registrationDate);
		expect(user.isVerified).toEqual(doc.isVerified);
	});

	it('Get unexisting user id', async() => {
		const doc = await userRepo.save(createData);

		//NOTE: The string must be a valid ObjectId! Can't be a string like "abcd124"
		await expect(userRepo.get("41224d776a326fb40f000001")).rejects.toThrow("Unauthorized");
	});

	it('Get unexisting user id non object id', async() => {
		const doc = await userRepo.save(createData);

		await expect(userRepo.get("aaaa")).rejects.toThrow("Cast to ObjectId failed for value \"aaaa\" (type string) at path \"_id\" for model \"User\"");
	});

	it('Get user with unexisting username', async() => {
		const doc = await userRepo.save(createData);

		await expect(userRepo.getByNameOrEmail("hello")).rejects.toThrow("Unauthorized");
	});

	it('Get user with unexisting email', async() => {
		const doc = await userRepo.save(createData);

		await expect(userRepo.getByNameOrEmail("hello@hello.es")).rejects.toThrow("Unauthorized");
	});

	it('Get existing user by name', async() => {
		const doc = await userRepo.save(createData);

		const user = await userRepo.getByNameOrEmail(doc.username);
		expect(user._id).toEqual(doc._id);
		expect(user.username).toEqual(doc.username);
		expect(user.email).toEqual(doc.email);
		expect(user.registrationDate).toEqual(doc.registrationDate);
		expect(user.isVerified).toEqual(doc.isVerified);
	});

	it('Get existing user by email', async() => {
		const doc = await userRepo.save(createData);

		const user = await userRepo.getByNameOrEmail(doc.email);
		expect(user._id).toEqual(doc._id);
		expect(user.username).toEqual(doc.username);
		expect(user.email).toEqual(doc.email);
		expect(user.registrationDate).toEqual(doc.registrationDate);
		expect(user.isVerified).toEqual(doc.isVerified);
	});

	it('Get existing user by stripe id', async() => {
		//TODO!
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
