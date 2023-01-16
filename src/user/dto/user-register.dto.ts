import { IsArray, IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { Role } from '../user.entity';

export class UserRegisterDto {
	@IsString()
	@IsNotEmpty()
	fullName: string;

	@IsEnum(Role)
	role: Role;

	@IsPhoneNumber()
	phoneNumber: string;

	//todo isStrong password
	@IsString()
	password: string;

	@IsArray()
	@IsString({ each: true })
	// todo depends on Role validation
	lawArea: string[];
}
