import { IsInt, IsNotEmpty, IsString, Max, MaxLength } from "class-validator"
import { FileExtensionType, FileType } from "../entity/UserDocument"

export class uploadDocument {

    @IsInt()
    @IsNotEmpty()
    userId : number

    @IsString()
    @IsNotEmpty()
    file : string

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    file_type : FileType

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    file_extension_type : FileExtensionType

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    file_name : string
}