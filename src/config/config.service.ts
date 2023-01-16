import 'reflect-metadata';
import { config, DotenvConfigOptions, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import path from 'path';
import { inject, injectable } from 'inversify';
import { ILogger } from '../logger/logger.service';
import { TYPES } from '../common/constants';

export interface IConfigService {
	get: (key: string) => string | undefined;
}

@injectable()
export class ConfigService implements IConfigService {
	private config: DotenvParseOutput = {};
	constructor(@inject(TYPES.ILogger) private logger: ILogger) {
		const envConfigOptions: DotenvConfigOptions = {};

		if (process.env.NODE_ENV === 'test') {
			envConfigOptions.path = path.resolve(process.cwd(), '.env.test');
		}

		const result: DotenvConfigOutput = config(envConfigOptions);
		if (result.error) {
			this.logger.error('[ConfigService] Failed to read .env file or it is missing');
			this.config = {};
		} else {
			this.logger.log('[ConfigService] Config .env loaded');
			this.config = result.parsed as DotenvParseOutput;
		}
	}

	get(key: string): string | undefined {
		const value = this.config[key];
		if (!value && process.env.NODE_ENV !== 'test') {
			this.logger.error(`[ConfigService] Failed to read value by key: ${key}`);
		}
		return value;
	}
}
