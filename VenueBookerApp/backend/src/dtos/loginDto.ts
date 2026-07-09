import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class LoginDTO {

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    username : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    password : string
}
