import request from 'supertest';

import { App } from '../src/app';
import { boot } from '../src/main';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

const wrongDataForRegister = {
	fullName: '',
	role: 'lawyyyyer',
	phoneNumber: '+7999456789',
	password: 123,
	lawArea: 'Семейное право',
};

const rightDataForRegister = {
	fullName: 'Max',
	role: 'lawyer',
	phoneNumber: '+79994567892',
	password: 'password',
	lawArea: ['Административное право', 'Семейное право'],
};

describe('User e2e', () => {
	it('Registration should failed - not valid register data', async () => {
		const res = await request(application.app).post('/user/register').send(wrongDataForRegister);
		expect(res.statusCode).toBe(422);
		expect(res.body[0].constraints.isNotEmpty).toBe('fullName should not be empty');
		expect(res.body[1].constraints.isEnum).toBe(
			'role must be one of the following values: client, lawyer',
		);
		expect(res.body[2].constraints.isPhoneNumber).toBe('phoneNumber must be a valid phone number');
		expect(res.body[3].constraints.isString).toBe('password must be a string');
		expect(res.body[4].constraints.isArray).toBe('lawArea must be an array');
	});

	it('Registration should succeed', async () => {
		const res = await request(application.app).post('/user/register').send(rightDataForRegister);
		expect(res.statusCode).toBe(200);
		expect(res.body.fullName).toEqual(rightDataForRegister.fullName);
		expect(res.body.phoneNumber).toEqual(rightDataForRegister.phoneNumber);
	});

	it('Registration should failed - user already exist', async () => {
		const res = await request(application.app).post('/user/register').send(rightDataForRegister);
		expect(res.statusCode).toBe(422);
		expect(res.body.err).toBe('User with this phone number already exists');
	});

	it('Login should failed - wrong password', async () => {
		const res = await request(application.app)
			.post('/user/login')
			.send({
				phoneNumber: rightDataForRegister.phoneNumber,
				password: rightDataForRegister.password + '1',
			});
		expect(res.statusCode).toBe(401);
		expect(res.body.err).toBe('Unauthorized error');
	});

	it('Login should succeed', async () => {
		const res = await request(application.app).post('/user/login').send({
			phoneNumber: rightDataForRegister.phoneNumber,
			password: rightDataForRegister.password,
		});
		expect(res.statusCode).toBe(200);
		expect(res.body.jwt).not.toBeUndefined();
	});
});

afterAll(async () => {
	await application.close();
});
