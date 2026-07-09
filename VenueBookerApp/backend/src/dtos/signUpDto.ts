import {IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class SignUpDTO {

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(40)
    email : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    password : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    first_name : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    last_name : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    username : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    role : string

    @IsOptional()
    @IsString()
    @MaxLength(10)
    @MinLength(10)
    phone?: string
}
