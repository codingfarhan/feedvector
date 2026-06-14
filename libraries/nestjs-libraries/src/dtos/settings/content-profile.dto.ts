import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ContentProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  role!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  audience!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  goal!: string;
}
