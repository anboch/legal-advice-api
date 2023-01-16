import 'reflect-metadata';
import express, { Express } from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { json } from 'body-parser';

import { ILogger } from './logger/logger.service';
import { TYPES } from './common/constants';
import { IConfigService } from './config/config.service';
import { IExceptionFilter } from './errors/exception.filter';

@injectable()
export class App {
	server: Server;
	port: number;
	app: Express;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
	) {
		this.app = express();
		this.port = Number(this.configService.get('PORT')) || 5000;
	}

	useExceptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	async init(): Promise<void> {
		this.useRoutes();
		this.useExceptionFilters();
		this.server = this.app.listen(this.port);
		this.logger.log(`[APP] Server is running on port ${this.port}`);
	}
}
