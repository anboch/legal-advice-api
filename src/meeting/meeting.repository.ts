import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';

import { collectionNames, TYPES } from '../common/constants';
import { MongooseService } from '../database/mongoose.service';
import { Meeting, MeetingModel, MeetingSchema } from './meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';

export interface IMeetingRepository {
	create: (data: CreateMeetingDto) => Promise<Meeting>;
	getAllForUser: (userId: mongoose.Types.ObjectId) => Promise<Meeting[]>;
}

@injectable()
export class MeetingRepository implements IMeetingRepository {
	meetingModel: typeof MeetingModel;
	constructor(@inject(TYPES.MongooseService) private mongooseService: MongooseService) {
		this.meetingModel = this.mongooseService.client.connection.model(
			collectionNames.MEETING,
			MeetingSchema,
			collectionNames.MEETING,
		);
	}

	async create(data: CreateMeetingDto): Promise<Meeting> {
		const newMeeting = new this.meetingModel(data);
		return newMeeting.save();
	}

	async getAllForUser(userId: mongoose.Types.ObjectId): Promise<Meeting[]> {
		return this.meetingModel.find({ $or: [{ clientId: userId }, { lawyerId: userId }] }).exec();
	}
}
