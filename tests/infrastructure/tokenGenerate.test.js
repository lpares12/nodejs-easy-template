'use strict';

const mongoose = require('mongoose');

const dbHandler = require('../dbSetup');

const tokenModel = require('../../app/domain/user/model/token.js');
const userRepo = require('../../app/infrastructure/user/repository.js');

beforeAll(async () => { await dbHandler.connect() });
afterEach(async () => { await dbHandler.clearDatabase() });
afterAll(async () => { await dbHandler.closeDatabase() });

describe('userRepositoryGenerateToken', () => {
	it('Can be generated with type emailValidation', async() => {
		const doc = await userRepo.save(createData);

		const first = new Date();
		var token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});

		expect(token.createdAt.getTime()).toBeGreaterThan(first.getTime());
		//TODO: Check expires field to 1h
		expect(token.type).toEqual('emailValidation');
		expect(token._userId).toEqual(doc._id);
	});

	it('Can be generated with type passwordReset', async() => {
		var doc = await userRepo.save(createData);

		const first = new Date();
		var token = await userRepo.generateToken({userId: doc._id, type: 'passwordReset'});

		expect(token.createdAt.getTime()).toBeGreaterThan(first.getTime());
		//TODO: Check expires field to 1h
		expect(token.type).toEqual('passwordReset');
		expect(token._userId).toEqual(doc._id);
	});

	it('Is hashed', async() => {
		const doc = await userRepo.save(createData);
		const token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});
		const savedToken = await tokenModel.findOne();

		//Make sure token was hashed
		expect(token.token).not.toEqual(savedToken.token);
	});

	it('Previous tokens are removed', async() => {
		var doc = await userRepo.save(createData);

		var token = await userRepo.generateToken({userId: doc._id, type: 'passwordReset'});
		var nDocs = await tokenModel.countDocuments();
		expect(nDocs).toEqual(1);

		token = await userRepo.generateToken({userId: doc._id, type: 'emailValidation'});
		nDocs = await tokenModel.countDocuments();
		expect(nDocs).toEqual(1);

		//Check token is indeed the new one
		const tokenDoc = await tokenModel.findOne();
		expect(tokenDoc.type).toEqual('emailValidation')
	});

	it('Unexisting user', async() => {
		await expect(userRepo.generateToken(
			{userId: "41224d776a326fb40f000001",type: 'emailValidation'}))
			.rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.generateToken(
			{userId: "41224d776a326fb40f000001",type: 'emailValidation'}))
			.rejects.toThrow('Token validation failed: _userId: Path `_userId` is required.');
	});

	it('Invalid user id', async() => {
		await expect(userRepo.generateToken(
			{userId: "4000001",type: 'emailValidation'}))
			.rejects.toThrow(mongoose.Error.ValidationError);
		await expect(userRepo.generateToken(
			{userId: "4000001",type: 'emailValidation'}))
			.rejects.toThrow('Token validation failed: _userId: Path `_userId` is required.');
		await expect(userRepo.generateToken(
			{userId: null, type: 'emailValidation'}))
			.rejects.toThrow(mongoose.Error.TypeError);
		await expect(userRepo.generateToken(
			{userId: null, type: 'emailValidation'}))
			.rejects.toThrow("Cannot read properties of null (reading '_id')");
	});

	it('Invalid type', async() => {
		const doc = await userRepo.save(createData);

		await expect(userRepo.generateToken(
			{userId: doc._id, type: 'hello'}))
			.rejects.toThrow(mongoose.Error.TypeError);
		await expect(userRepo.generateToken(
			{userId: doc._id, type: 'hello'}))
			.rejects.toThrow("Token validation failed: type: `hello` is not a valid enum value for path `type`.");
	});

});

const createData = {
	'email': 'test@test.com',
	'username': 'tester',
	'password': 'Tester23+',
};
