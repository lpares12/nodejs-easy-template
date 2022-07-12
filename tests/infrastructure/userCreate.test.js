'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const userModel = require('../../app/domain/user/model/user.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositoryCreate', () => {
	it('Can be created', async() => {
		const doc = await userRepo.save(userComplete);

		expect(doc.username).toEqual(userComplete.username);
		expect(doc.email).toEqual(userComplete.email);
		//For password we will make other tests 
		expect(doc.isVerified).toEqual(false);

		//TODO: check why this doesnt work
		//expect(doc).not.toHaveProperty('lastLogin');

		//Subscripton things
		expect(doc.plan).toEqual("none");
		expect(doc.subscriptionEndDate).toEqual(userComplete.subscriptionEndDate);
		expect(doc.stripeId).toEqual(null);
		expect(doc.membershipCancelled).toEqual(false);

		//Password should not be returned
		expect(doc.password).toEqual(null);
	});

	it('Existing email', async() => {
		await expect(userRepo.save(userComplete)).resolves.not.toThrow();

		await expect(userRepo.save(userUniqueEmail)).rejects.toThrow("E11000 duplicate key error collection: test.users index: email_1 dup key: { email: \"test@test.com\" }");
	});

	it('Existing username', async() => {
		await expect(userRepo.save(userComplete)).resolves.not.toThrow();

		await expect(userRepo.save(userUniqueUsername)).rejects.toThrow("E11000 duplicate key error collection: test.users index: username_1 dup key: { username: \"tester\" }");
	});

	it('Wrong password', async() => {
		var data = userWrongPassword;

		await expect(userRepo.save(data)).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save(data)).rejects.toThrow("User validation failed: password: should contain alphanumeric characters and one special character");

		data.password = "Tester+";
		await expect(userRepo.save(data)).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save(data)).rejects.toThrow("User validation failed: password: should contain alphanumeric characters and one special character");

		data.password = "234564663+";
		await expect(userRepo.save(data)).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save(data)).rejects.toThrow("User validation failed: password: should contain alphanumeric characters and one special character");
	});

	it('Long password', async() => {
		await expect(userRepo.save(userLongPassword)).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save(userLongPassword)).rejects.toThrow("User validation failed: password: should be between 6 and 30 characters");
	});

	it('Invalid email', async() => {
		var data = userComplete;
		data.email = 'test@test.'
		await expect(userRepo.save(data)).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save(data)).rejects.toThrow("User validation failed: email: invalid email");
	});

	it('Empty data', async() => {
		await expect(userRepo.save()).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save()).rejects.toThrow("User validation failed: password: Path `password` is required., username: Path `username` is required., email: Path `email` is required.");

		await expect(userRepo.save({})).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save({})).rejects.toThrow("User validation failed: password: Path `password` is required., username: Path `username` is required., email: Path `email` is required.");

		await expect(userRepo.save({'email': 'test@test.com'})).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save({'email': 'test@test.com'})).rejects.toThrow("User validation failed: password: Path `password` is required., username: Path `username` is required.");

		await expect(userRepo.save({'username': 'test'})).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save({'username': 'test'})).rejects.toThrow("User validation failed: password: Path `password` is required., email: Path `email` is required.");

		await expect(userRepo.save({'password': 'Test23+'})).rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.save({'password': 'Test23+'})).rejects.toThrow("User validation failed: username: Path `username` is required., email: Path `email` is required.");
	});

	it('No trial', async() => {
		const doc = await userRepo.save(userNoTrial);
		expect(doc.username).toEqual(userNoTrial.username);
		expect(doc.email).toEqual(userNoTrial.email);
		expect(doc.subscriptionEndDate).toEqual(null);
	});
});

var trialEnd = new Date();
trialEnd.setDate(trialEnd.getDate() + parseInt(process.env.TRIAL_DAYS));

const userComplete = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
	'subscriptionEndDate': trialEnd, 
};

const userUniqueEmail = {
	'email': 'test@test.com',
	'username': 'tester2',
	'password': 'Tester23+',
	'subscriptionEndDate': trialEnd, 
};

const userUniqueUsername = {
	'email': 'test2@test.com',
	'username': 'tester',
	'password': 'Tester23+',
	'subscriptionEndDate': trialEnd, 
};

const userWrongPassword = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23',
	'subscriptionEndDate': trialEnd, 
};

const userLongPassword = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+123456789012345678901234567890',
	'subscriptionEndDate': trialEnd, 
};

const userNoTrial = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
};
