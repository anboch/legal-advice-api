import request from 'supertest';

import { App } from '../src/app';
import { boot } from '../src/main';
import { Role } from '../src/user/user.entity';

let application: App;

const client = {
	fullName: 'Max',
	role: Role.CLIENT,
	phoneNumber: '+79994567891',
	password: 'password',
	lawArea: [],
	userId: '',
	jwt: '',
};

const lawyer = {
	fullName: 'Viktor',
	role: Role.LAWYER,
	phoneNumber: '+79994567892',
	password: 'password',
	lawArea: ['Административное право', 'Семейное право'],
	userId: '',
	jwt: '',
};

const wrongDataForSignUp = {
	clientId: '',
	lawyerId: '',
	time: 1675228860,
};

beforeAll(async () => {
	const { app } = await boot;
	application = app;

	// register and login users
	for (const user of [client, lawyer]) {
		const registerResponse = await request(application.app).post('/user/register').send(user);
		user.userId = registerResponse.body.userId;
		const loginResponse = await request(application.app).post('/user/login').send({
			phoneNumber: user.phoneNumber,
			password: user.password,
		});
		user.jwt = loginResponse.body.jwt;
	}
});

describe('Meeting e2e', () => {
	it('Sign up should failed - user is not authorized', async () => {
		const res = await request(application.app).post('/meeting/sign-up');
		expect(res.statusCode).toBe(401);
		expect(res.body.error).toBe('You are not authorized');
	});

	it('Sign up should failed - not valid sign up data', async () => {
		const res = await request(application.app)
			.post('/meeting/sign-up')
			.set('Authorization', `Bearer ${client.jwt}`)
			.send(wrongDataForSignUp);
		expect(res.statusCode).toBe(422);
		expect(res.body[0].constraints.isMongoId).toBe('clientId must be a mongodb id');
		expect(res.body[1].constraints.isMongoId).toBe('lawyerId must be a mongodb id');
		expect(res.body[2].constraints.min).toBe('time must be equal to 13 characters');
	});

	it('Sign up should succeed', async () => {
		const desireTime = Date.now() + 25 * 60 * 60 * 1000;
		const res = await request(application.app)
			.post('/meeting/sign-up')
			.set('Authorization', `Bearer ${client.jwt}`)
			.send({
				clientId: client.userId,
				lawyerId: lawyer.userId,
				time: desireTime,
			});
		expect(res.statusCode).toBe(201);
		expect(res.body.meetingTime).toBe(desireTime);
	});
});

afterAll(async () => {
	await application.close();
});
