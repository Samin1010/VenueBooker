import { IsDate, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from "class-validator";


export class AddApplicationDTO {
    
    @IsInt()
    @IsNotEmpty()
    userId : number

    @IsInt()
    @IsNotEmpty()
    venueId : number

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(40)
    eventName : string

    @IsNotEmpty()
    @IsInt()
    @Max(32000)
    @Min(1)
    expectedGuests : number

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

}
