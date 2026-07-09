import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class UserPreferenceDTO {
    @IsNotEmpty()
    @IsInt()
    userId : number
    
    @IsNotEmpty()
    @IsInt()
    venueId : number
    
    @IsNotEmpty()
    @IsInt()
    pref_no : number

}