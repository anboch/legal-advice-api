import mongoose from 'mongoose';
import { prop, getModelForClass, buildSchema } from '@typegoose/typegoose';

export enum Role {
	CLIENT = 'client',
	LAWYER = 'lawyer',
}

export class User {
	_id: mongoose.Types.ObjectId;
	@prop()
	fullName: string;

	@prop()
	role: Role;

	@prop({ unique: true })
	phoneNumber: string;

	@prop()
	passwordHash: string;

	@prop({ type: () => [String] })
	lawArea: string[];
}

export const UserModel = getModelForClass(User);
export const UserSchema = buildSchema(User);
