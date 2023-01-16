import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { NextFunction, Request, Response } from 'express';

import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { TYPES } from '../common/constants';
import { ValidateMiddleware } from '../common/validate.middleware';
import { AuthGuard } from '../common/auth.guard';
import { IMeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { IUserService } from '../user/user.service';
import { Role } from '../user/user.entity';

export interface IMeetingsController {
	signUp: (req: Request, res: Response, next: NextFunction) => void;
}

@injectable()
export class MeetingController extends BaseController implements IMeetingsController {
	constructor(
		@inject(TYPES.MeetingService) private meetingService: IMeetingService,
		@inject(TYPES.UserService) private userService: IUserService,
	) {
		super();
		this.bindRoutes([
			{
				path: '/sign-up',
				method: 'post',
				func: this.signUp,
				middlewares: [new AuthGuard(), new ValidateMiddleware(CreateMeetingDto)],
			},
		]);
	}

	async signUp(
		{ body }: Request<{}, {}, CreateMeetingDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const lawyer = await this.userService.getUserById(body.lawyerId);
		if (lawyer?.role !== Role.LAWYER) {
			return next(new HTTPError(400, 'Wrong lawyer Id'));
		}

		const client = await this.userService.getUserById(body.clientId);
		if (client?.role !== Role.CLIENT) {
			return next(new HTTPError(400, 'Wrong client Id'));
		}

		if (body.time < Date.now()) {
			return next(new HTTPError(400, 'Wrong time'));
		}

		const isTimeAvailableForLawyer = await this.meetingService.isTimeAvailable(
			body.time,
			body.lawyerId,
		);
		if (!isTimeAvailableForLawyer) {
			return next(new HTTPError(400, 'This time is not available for lawyer'));
		}

		const isTimeAvailableForClient = await this.meetingService.isTimeAvailable(
			body.time,
			body.clientId,
		);
		if (!isTimeAvailableForClient) {
			return next(new HTTPError(400, 'This time is not available for client'));
		}

		const newMeeting = await this.meetingService.makeAppointment(body, client, lawyer);
		this.send(res, 201, { meetingTime: newMeeting?.time });
	}
}
