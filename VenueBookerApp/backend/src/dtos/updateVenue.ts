import type { SuitabilityType } from "@shared/types";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateVenueDTO {
  @IsString()
  @MaxLength(40)
  name: string;

  @IsString()
  @MaxLength(40)
  location: string;

  @IsNumber()
  @Min(0.01)
  price: number | null;

  @IsInt()
  @Max(32000)
  @Min(10)
  capacity: number | null;

  @IsString()
  @MaxLength(100)
  description: string;

  @IsString()
  @Matches(/^(https?:\/\/.+|\/.+)\.(jpg|jpeg|png|webp|gif)$/i, {
    message: "Image must be a valid image URL or local image path",
  })
  image: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsArray()
  @IsString({ each: true })
  suitabilities: SuitabilityType[];
}
