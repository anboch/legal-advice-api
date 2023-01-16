import 'reflect-metadata';
import { Container } from 'inversify';

import { TYPES } from '../common/constants';
import { IMeetingRepository } from './meeting.repository';
import { IMeetingService, MeetingService } from './meeting.service';
import { Meeting } from './meeting.entity';
import { NotificationService } from '../notification/notification.service';

type PublicNotificationService = Pick<
	NotificationService,
	'runNotificationEngine' | 'setRemindersForMeeting'
>;

const meetingRepositoryMock: IMeetingRepository = {
	create: jest.fn(),
	getAllForUser: jest.fn(),
};

const notificationServiceMock: PublicNotificationService = {
	setRemindersForMeeting: jest.fn(),
	runNotificationEngine: jest.fn(),
};

const container = new Container();
let meetingService: IMeetingService;
let meetingRepository: IMeetingRepository;
let notificationService: PublicNotificationService;

beforeAll(() => {
	container.bind<IMeetingService>(TYPES.MeetingService).to(MeetingService);
	container
		.bind<IMeetingRepository>(TYPES.MeetingRepository)
		.toConstantValue(meetingRepositoryMock);
	container
		.bind<PublicNotificationService>(TYPES.NotificationService)
		.toConstantValue(notificationServiceMock);

	meetingService = container.get<IMeetingService>(TYPES.MeetingService);
	meetingRepository = container.get<IMeetingRepository>(TYPES.MeetingRepository);
	notificationService = container.get<PublicNotificationService>(TYPES.NotificationService);
});

const mockUserMeetings: Pick<Meeting, 'time'>[] = [
	{
		time: 1675224000000, // 	Wed Feb 01 2023 10:00:00 GMT+0600
	},
	{
		time: 1675231200000, // 	Wed Feb 01 2023 12:00:00 GMT+0600
	},
	{
		time: 1675238400000, // 	Wed Feb 01 2023 14:00:00 GMT+0600
	},
];

const desireFreeTimes: number[] = [
	1675227600000, // Wed Feb 01 2023 11:00:00 GMT+0600
	1675228800000, // Wed Feb 01 2023 11:20:00 GMT+0600
	1675233600000, // Wed Feb 01 2023 12:40:00 GMT+0600
	1675234800000, // Wed Feb 01 2023 13:00:00 GMT+0600
];

const desireBusyTimes: number[] = [
	1675229400000, // Wed Feb 01 2023 11:30:00 GMT+0600
	1675228860000, // Wed Feb 01 2023 11:21:00 GMT+0600
	1675233540000, // Wed Feb 01 2023 12:39:00 GMT+0600
	1675236600000, // Wed Feb 01 2023 13:30:00 GMT+0600
];

describe('Meeting Service', () => {
	it('Time should available for appointment', async () => {
		meetingRepository.getAllForUser = jest.fn().mockReturnValue(mockUserMeetings);

		for (const time of desireFreeTimes) {
			const isTimeAvailable = await meetingService.isTimeAvailable(
				time,
				'63c0755b543d376b66093161',
			);
			expect(isTimeAvailable).toBeTruthy();
		}
	});

	it('Time should NOT available for appointment', async () => {
		meetingRepository.getAllForUser = jest.fn().mockReturnValue(mockUserMeetings);

		for (const time of desireBusyTimes) {
			const isTimeAvailable = await meetingService.isTimeAvailable(
				time,
				'63c0755b543d376b66093161',
			);
			expect(isTimeAvailable).toBeFalsy();
		}
	});
});
