import { IsDate, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class BookedTimeDTO {

    @IsString()
    @IsNotEmpty()
    date : string

    @IsString()
    @IsNotEmpty()
    time : string

    @IsInt()
    @IsNotEmpty()
    @Min(2)
    @Max(10)
    duration : number

    @IsInt()
    @IsNotEmpty()
    userId : number

}
