import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import Agenda from 'agenda';
import fs from 'fs';
import dayjs from 'dayjs';

import { ILogger } from '../logger/logger.service';
import { TYPES } from '../common/constants';
import { MongooseService } from '../database/mongoose.service';
import { Meeting } from '../meeting/meeting.entity';
import { User } from '../user/user.entity';

@injectable()
export class NotificationService {
	private agendaClient: Agenda | undefined;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.MongooseService) private mongooseService: MongooseService,
	) {}

	async setRemindersForMeeting(meeting: Meeting, client: User, lawyer: User): Promise<void> {
		await this.setDayBeforeReminder(meeting, client, lawyer);
		await this.setTwoHourBeforeReminder(meeting, client, lawyer);
	}

	private async setDayBeforeReminder(meeting: Meeting, client: User, lawyer: User): Promise<void> {
		const timeBefore = 24 * 60 * 60 * 1000;
		const timeForReminder = meeting.time - timeBefore;
		if (timeForReminder < Date.now()) {
			return;
		}
		const jobName = `Reminder: ${meeting._id} ${timeBefore}`;
		// eslint-disable-next-line prettier/prettier
		const message = `${ dayjs(timeForReminder).format() } | Привет ${ client?.fullName }. Напоминаем о консультации с юристом ${ lawyer?.fullName } завтра в ${ dayjs(meeting.time).format('HH:MM') }.`

		return this.setReminderToAgenda(jobName, message, timeForReminder);
	}

	private async setTwoHourBeforeReminder(
		meeting: Meeting,
		client: User,
		lawyer: User,
	): Promise<void> {
		const timeBefore = 2 * 60 * 60 * 1000;
		const timeForReminder = meeting.time - timeBefore;
		if (timeForReminder < Date.now()) {
			return;
		}
		const jobName = `Reminder: ${meeting._id} ${timeBefore}`;
		// eslint-disable-next-line prettier/prettier
		const message = `${ dayjs(timeForReminder).format() } | Привет ${ client?.fullName }. Через 2 часа у вас консультация с юристом ${ lawyer?.fullName }.`

		return this.setReminderToAgenda(jobName, message, timeForReminder);
	}

	private async setReminderToAgenda(
		jobName: string,
		message: string,
		timeForReminder: number,
	): Promise<void> {
		try {
			if (process.env.NODE_ENV === 'test') {
				this.writeToLogFile('TEST-' + message);
			}
			if (!this.agendaClient) {
				this.logger.error(`[NotificationService] Agenda is not defined while setting a reminder`);
				return;
			}
			this.agendaClient.define(jobName, async () => {
				await this.writeToLogFile(message);
			});
			(await this.agendaClient.schedule(new Date(timeForReminder), jobName, {})).save();
		} catch (error) {
			this.logger.error(`[NotificationService] Error while set ${jobName}`);
		}
	}

	private async writeToLogFile(text: string): Promise<void> {
		return new Promise<void>((resolve) => {
			fs.writeFile('./reminders.log', text + '\n', { flag: 'a' }, (err) => {
				if (err) {
					this.logger.error('[NotificationService] Error while writeToFile');
				}
				resolve();
			});
		});
	}

	async runNotificationEngine(): Promise<void> {
		try {
			this.agendaClient = new Agenda({ mongo: this.mongooseService.client.connection.db });
			await this.agendaClient.start();
		} catch (error) {
			this.logger.error('[NotificationService] Error while agendaClient start');
		}
	}

	async stopNotificationEngine(): Promise<void> {
		if (this.agendaClient) {
			return this.agendaClient.stop();
		}
	}
}
