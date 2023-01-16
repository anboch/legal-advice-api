import { Role } from '../user/user.entity';

export const usersDataForSeed = [
	{
		fullName: 'Andrew',
		role: Role.CLIENT,
		phoneNumber: '+79994567890',
		password: 'password',
		lawArea: [],
	},
	{
		fullName: 'Max',
		role: Role.CLIENT,
		phoneNumber: '+79994567891',
		password: 'password',
		lawArea: [],
	},
	{
		fullName: 'Viktor',
		role: Role.LAWYER,
		phoneNumber: '+79994567892',
		password: 'password',
		lawArea: ['Административное право', 'Семейное право'],
	},
	{
		fullName: 'Aleksander',
		role: Role.LAWYER,
		phoneNumber: '+79994567893',
		password: 'password',
		lawArea: ['Административное право', 'Семейное право'],
	},
];
