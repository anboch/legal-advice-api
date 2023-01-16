import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { compare, hash } from 'bcryptjs';

import { IConfigService } from '../config/config.service';
import { TYPES } from '../common/constants';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { IUserRepository } from './user.repository';

export interface IUserService {
	createUser: (dto: UserRegisterDto) => Promise<User>;
	validateUser: (dto: UserLoginDto) => Promise<User | null>;
	getUserByPhone: (phoneNumber: string) => Promise<User | null>;
	getUserById: (userId: string) => Promise<User | null>;
	getAllUsers: () => Promise<User[]>;
}

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UserRepository) private userRepository: IUserRepository,
	) {}

	async createUser({
		fullName,
		role,
		phoneNumber,
		password,
		lawArea,
	}: UserRegisterDto): Promise<User> {
		const salt = Number(this.configService.get('SALT'));
		const passwordHash = await hash(password, salt);
		return this.userRepository.create({ fullName, role, phoneNumber, passwordHash, lawArea });
	}

	async validateUser({ phoneNumber, password }: UserLoginDto): Promise<User | null> {
		const existedUser = await this.getUserByPhone(phoneNumber);
		if (!existedUser) {
			return null;
		}
		if (await compare(password, existedUser.passwordHash)) {
			return existedUser;
		}
		return null;
	}

	async getUserByPhone(phoneNumber: string): Promise<User | null> {
		return this.userRepository.findByPhone(phoneNumber);
	}

	async getUserById(userId: string): Promise<User | null> {
		return this.userRepository.findById(userId);
	}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.findAll();
	}
}
