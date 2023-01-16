import 'reflect-metadata';
import { Container, ContainerModule, interfaces } from 'inversify';

import { App } from './app';
import { ConfigService, IConfigService } from './config/config.service';
import { MongooseService } from './database/mongoose.service';
import { ExceptionFilter, IExceptionFilter } from './errors/exception.filter';
import { ILogger, LoggerService } from './logger/logger.service';
import { TYPES } from './common/constants';
import { UserController, IUserController } from './user/user.controller';
import { UserRepository, IUserRepository } from './user/user.repository';
import { UserService, IUserService } from './user/user.service';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<MongooseService>(TYPES.MongooseService).to(MongooseService).inSingletonScope();
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<IUserService>(TYPES.UserService).to(UserService);
	bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
	bind<App>(TYPES.Application).to(App);
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();
	return { appContainer, app };
}

export const boot = bootstrap();
