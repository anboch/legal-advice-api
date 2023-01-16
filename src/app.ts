import 'reflect-metadata';
import express, { Express } from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { json } from 'body-parser';

import { ILogger } from './logger/logger.service';
import { TYPES } from './common/constants';
import { IConfigService } from './config/config.service';
import { IExceptionFilter } from './errors/exception.filter';
import { UserController } from './user/user.controller';
import { AuthMiddleware } from './common/auth.middleware';
import { MongooseService } from './database/mongoose.service';

@injectable()
export class App {
	server: Server;
	port: number;
	app: Express;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
		@inject(TYPES.MongooseService) private mongooseService: MongooseService,
		@inject(TYPES.UserController) private userController: UserController,
	) {
		this.app = express();
		this.port = Number(this.configService.get('PORT')) || 5000;
	}

	useMiddleware(): void {
		this.app.use(json());

		const jwtSecret = this.configService.get('JWT_SECRET');
		if (!jwtSecret) {
			this.logger.error(`[APP] JWT_SECRET required (Has been setting default value)`);
		}
		const authMiddleware = new AuthMiddleware(jwtSecret || 'SECRET');
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	useRoutes(): void {
		this.app.use('/user', this.userController.router);
	}

	useExceptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		this.useExceptionFilters();
		await this.mongooseService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log(`[APP] Server is running on port ${this.port}`);
	}
}
