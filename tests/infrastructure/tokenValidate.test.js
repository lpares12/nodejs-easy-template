'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const tokenModel = require('../../app/domain/user/model/token.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositoryValidateToken', () => {
	it('Can be validated', async() => {
		const doc = await userRepo.save(createData);
		const token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});

		await expect(userRepo.validateToken({userId: doc._id,
						token: token.token,
						type: 'emailValidation'})).resolves.not.toThrow();
	});

	it('Wrong type', async() => {
		const doc = await userRepo.save(createData);
		const token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});

		await expect(userRepo.validateToken({userId: doc._id,
						token: token.token,
						type: 'passwordReset'})).rejects.toThrow();
		await expect(userRepo.validateToken({userId: doc._id,
						token: token.token,
						type: 'passwordReset'})).rejects.toThrow("Token not found or expired");
	});

	it('Unexisting user id', async() => {
		const doc = await userRepo.save(createData);
		const token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});

		await expect(userRepo.validateToken({userId: "41224d776a326fb40f000001",
						token: token.token,
						type: 'emailValidation'})).rejects.toThrow("Token not found or expired");
	});

	it('Unexisting token', async() => {
		const doc = await userRepo.save(createData);
		const token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});

		await expect(userRepo.validateToken({userId: doc._id,
						token: "helloUnexistingToken",
						type: 'emailValidation'})).rejects.toThrow("Token not found or expired");
	});

	if('Invalid parameters', async() => {
		const doc = await userRepo.save(createData);
		const token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});

		await expect(userRepo.validateToken({userId: null,
						token: token.token,
						type: 'emailValidation'})).rejects.toThrow("Token not found or expired");

		await expect(userRepo.validateToken({userId: "aaa",
						token: token.token,
						type: 'emailValidation'})).rejects.toThrow("Token not found or expired");

		await expect(userRepo.validateToken({userId: doc._id,
						token: null,
						type: 'emailValidation'})).rejects.toThrow("Token not found or expired");

		await expect(userRepo.validateToken({userId: doc._id,
						token: {},
						type: 'emailValidation'})).rejects.toThrow("Token not found or expired");

		await expect(userRepo.validateToken({userId: doc._id,
						token: token.token,
						type: 'hello'})).rejects.toThrow("Token not found or expired");
	});
});

const createData = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
};
