export const TYPES = {
	Application: Symbol.for('Application'),
	ILogger: Symbol.for('ILogger'),
	ExceptionFilter: Symbol.for('ExceptionFilter'),
	ConfigService: Symbol.for('ConfigService'),
	MongooseService: Symbol.for('MongooseService'),
	UserController: Symbol.for('UserController'),
	UserService: Symbol.for('UserService'),
	UserRepository: Symbol.for('UserRepository'),
	MeetingController: Symbol.for('MeetingController'),
	MeetingService: Symbol.for('MeetingService'),
	MeetingRepository: Symbol.for('MeetingRepository'),
};

export const collectionNames = {
	USER: 'users',
	MEETING: 'meetings',
} as const;
