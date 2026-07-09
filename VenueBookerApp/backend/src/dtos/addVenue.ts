import type { SuitabilityType } from "@shared/types";
import {
    ArrayNotEmpty,
    IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class AddVenueDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  location: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @IsInt()
  @IsNotEmpty()
  @Min(10)
  capacity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  price: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(https?:\/\/.+|\/.+)\.(jpg|jpeg|png|webp|gif)$/i, {
    message: "Image must be a valid image URL or local image path",
  })
  image: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  suitabilities: SuitabilityType[];

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;
}
