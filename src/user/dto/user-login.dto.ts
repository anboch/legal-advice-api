import { IsPhoneNumber, IsString } from 'class-validator';

export class UserLoginDto {
	@IsPhoneNumber()
	phoneNumber: string;

	@IsString()
	password: string;
}
