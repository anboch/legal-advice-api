import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';

import { TYPES } from '../common/constants';
import { Meeting } from './meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { IMeetingRepository } from './meeting.repository';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.entity';

export interface IMeetingService {
	isTimeAvailable: (time: number, userId: mongoose.Types.ObjectId) => Promise<boolean>;
	makeAppointment: (data: CreateMeetingDto, client: User, lawyer: User) => Promise<Meeting>;
}

@injectable()
export class MeetingService implements IMeetingService {
	constructor(
		@inject(TYPES.NotificationService) private notificationService: NotificationService,
		@inject(TYPES.MeetingRepository) private meetingRepository: IMeetingRepository,
	) {}

	async isTimeAvailable(desiredTime: number, userId: mongoose.Types.ObjectId): Promise<boolean> {
		const userSchedule = await this.meetingRepository.getAllForUser(userId);
		const meetingDuration = 40 * 60 * 1000;
		const crossMeeting = userSchedule.find(
			(meeting) => Math.abs(desiredTime - meeting.time) < meetingDuration,
		);
		return !crossMeeting;
	}

	async makeAppointment(data: CreateMeetingDto, client: User, lawyer: User): Promise<Meeting> {
		const newMeeting = await this.meetingRepository.create(data);
		await this.notificationService.setRemindersForMeeting(newMeeting, client, lawyer);
		return newMeeting;
	}
}
