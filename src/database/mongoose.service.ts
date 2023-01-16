import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import mongoose, { Mongoose } from 'mongoose';
import { ILogger } from '../logger/logger.service';
import { TYPES } from '../common/constants';
import { IConfigService } from '../config/config.service';
import { MongoMemoryServer } from 'mongodb-memory-server';

@injectable()
export class MongooseService {
	client: Mongoose;
	private mongoMemoryServer: MongoMemoryServer | undefined;

	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {
		this.client = mongoose;
	}

	private getMongoURI(): string {
		return (
			'mongodb://' +
			this.configService.get('MONGO_LOGIN') +
			':' +
			this.configService.get('MONGO_PASSWORD') +
			'@' +
			this.configService.get('MONGO_HOST') +
			':' +
			this.configService.get('MONGO_PORT') +
			'/' +
			this.configService.get('MONGO_DATABASE') +
			'?' +
			`authSource=${this.configService.get('MONGO_AUTH_DATABASE')}`
		);
	}

	async connect(): Promise<void> {
		try {
			let URI = this.getMongoURI();

			if (process.env.NODE_ENV === 'test') {
				this.mongoMemoryServer = await MongoMemoryServer.create();
				URI = this.mongoMemoryServer.getUri();
			}

			this.client.set('strictQuery', false);
			await this.client.connect(URI);
			this.logger.log('[MongooseService] Successful connection to the database');
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error('[MongooseService] Database connection error: ' + e.message);
			}
		}
	}

	async closeConnection(): Promise<void> {
		try {
			await this.client.connection.close();

			if (this.mongoMemoryServer) {
				await this.mongoMemoryServer.stop();
			}
		} catch (error) {
			this.logger.error('[MongooseService] error while close connection');
		}
	}
}
