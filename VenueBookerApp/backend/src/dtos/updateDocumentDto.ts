import type { FileExtensionType, FileType } from "../entity/UserDocument"
import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class updateDocumentDto {
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