import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Full name must not be empty' })
  @IsString()
  fullname!: string;

  @IsEmail({}, { message: 'Email format is invalid' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak (requires uppercase, lowercase, and a number)',
  })
  password!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;
  
  @IsNotEmpty()
  @IsString()
  roleId!: string;
}