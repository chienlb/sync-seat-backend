import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString()
  password!: string;
}