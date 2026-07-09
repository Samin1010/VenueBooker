import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseAuthDTO {
    @IsInt()
    @IsNotEmpty()
    userId : number
}