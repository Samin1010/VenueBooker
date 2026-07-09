import { IsIn, IsInt, IsNotEmpty, IsString } from "class-validator";
import { ApplicationStatus } from "../entity/Application";

export class UpdateApplicationDTO {

    @IsNotEmpty()
    @IsString()
    @IsIn(["accepted", "rejected"])
    status : ApplicationStatus

    @IsInt()
    @IsNotEmpty()
    userId : number
}
