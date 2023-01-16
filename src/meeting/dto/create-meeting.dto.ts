import { IsNumber, IsPhoneNumber, Max, Min } from 'class-validator';

export class CreateMeetingDto {
	@IsPhoneNumber()
	clientPhoneNumber: string;

	@IsPhoneNumber()
	lawyerPhoneNumber: string;

	@IsNumber()
	@Min(1000000000000, { message: 'time must be equal to 13 characters' })
	@Max(9999999999999, { message: 'time must be equal to 13 characters' })
	time: number;
}
