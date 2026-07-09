import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from "class-validator";

export class UpdateUserDTO {

    @IsOptional()
    @IsString()
    @MaxLength(40)
    first_name?: string

    @IsOptional()
    @IsString()
    @MaxLength(40)
    last_name?: string


    @IsOptional()
    @IsString()
    @MaxLength(40)
    username?: string

    @IsOptional()
    @IsEmail()
    @IsString()
    @MaxLength(40)
    email?: string

    @IsOptional()
    @IsString()
    @MaxLength(10)
    @Matches(/^\d{10}$/)
    phone?: string
}
