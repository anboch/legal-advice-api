import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';

import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { TYPES } from '../common/constants';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ValidateMiddleware } from '../common/validate.middleware';
import { IConfigService } from '../config/config.service';
import { IUserService } from './user.service';
import { ILogger } from '../logger/logger.service';

export interface IUserController {
	login: (req: Request, res: Response, next: NextFunction) => void;
	register: (req: Request, res: Response, next: NextFunction) => void;
	seed: (req: Request, res: Response, next: NextFunction) => void;
}

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {
		super();
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/seed',
				method: 'get',
				func: this.seed,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
		]);
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const existedUser = await this.userService.getUserByPhone(body.phoneNumber);
		if (existedUser) {
			return next(new HTTPError(422, 'User with this phone number already exists', '/register'));
		}
		const createdUser = await this.userService.createUser(body);
		this.send(res, 200, {
			fullName: createdUser?.fullName,
			phoneNumber: createdUser?.phoneNumber,
		});
	}

	async login(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const validUser = await this.userService.validateUser(body);
		if (!validUser) {
			return next(new HTTPError(401, 'Unauthorized error', '/login'));
		}

		const jwtSecret = this.configService.get('JWT_SECRET');
		if (!jwtSecret) {
			this.logger.error(`[UserController] JWT_SECRET required (Has been setting default value)`);
		}
		const jwt = await this.signJWT(validUser._id.toString(), jwtSecret || 'SECRET');
		this.send(res, 200, { jwt });
	}

	private signJWT(userId: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const payload: Pick<Request, 'userId' | 'iat'> = {
				userId,
				iat: Math.floor(Date.now() / 1000),
			};
			sign(
				payload,
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					} else if (token) {
						resolve(token);
					}
				},
			);
		});
	}

	async seed(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const allUsers = await this.userService.getAllUsers();
		if (allUsers.length) {
			return next(new HTTPError(409, 'Database has already been seeded', '/seed'));
		}
		const usersDataForRegister = await this.userService.seedUsersFromFile();
		this.send(res, 200, usersDataForRegister);
	}
}
