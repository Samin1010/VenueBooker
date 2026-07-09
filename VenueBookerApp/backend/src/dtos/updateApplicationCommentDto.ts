import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateApplicationCommentDTO {
  @IsString()
  @MaxLength(40)
  comment: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
