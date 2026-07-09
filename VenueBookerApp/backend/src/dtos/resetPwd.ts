import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class ResetPwdDTO {

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(40)
    email : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    password : string
}
