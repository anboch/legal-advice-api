import mongoose from 'mongoose';
import { prop, getModelForClass, buildSchema, Ref } from '@typegoose/typegoose';

import { User } from '../user/user.entity';

export class Meeting {
	_id: mongoose.Types.ObjectId;

	@prop({ ref: () => User })
	clientId: Ref<User>;

	@prop({ ref: () => User })
	lawyerId: Ref<User>;

	@prop()
	time: number;
}

export const MeetingModel = getModelForClass(Meeting);
export const MeetingSchema = buildSchema(Meeting);
