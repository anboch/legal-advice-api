import 'reflect-metadata';
import { inject, injectable } from 'inversify';

import { User, UserSchema, UserModel } from './user.entity';
import { collectionNames, TYPES } from '../common/constants';
import { MongooseService } from '../database/mongoose.service';

export interface IUserRepository {
	create: (user: Omit<User, '_id'>) => Promise<User>;
	findByPhone: (phoneNumber: string) => Promise<User | null>;
	findById: (userId: string) => Promise<User | null>;
	findAll: () => Promise<User[]>;
}

@injectable()
export class UserRepository implements IUserRepository {
	userModel: typeof UserModel;
	constructor(@inject(TYPES.MongooseService) private mongooseService: MongooseService) {
		this.userModel = this.mongooseService.client.connection.model(
			collectionNames.USER,
			UserSchema,
			collectionNames.USER,
		);
	}

	async create(user: Omit<User, '_id'>): Promise<User> {
		const newUser = new this.userModel(user);
		return newUser.save();
	}

	async findByPhone(phoneNumber: string): Promise<User | null> {
		return this.userModel.findOne({ phoneNumber }).exec();
	}

	async findById(userId: string): Promise<User | null> {
		return this.userModel.findOne({ _id: userId }).exec();
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find({}).exec();
	}
}
