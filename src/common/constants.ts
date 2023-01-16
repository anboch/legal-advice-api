export const TYPES = {
	Application: Symbol.for('Application'),
	ILogger: Symbol.for('ILogger'),
	ExceptionFilter: Symbol.for('ExceptionFilter'),
	ConfigService: Symbol.for('ConfigService'),
	MongooseService: Symbol.for('MongooseService'),
	UserController: Symbol.for('UserController'),
	UserService: Symbol.for('UserService'),
	UserRepository: Symbol.for('UserRepository'),
};

export const collectionNames = {
	USER: 'users',
} as const;
