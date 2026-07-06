import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContentProfileDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

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
