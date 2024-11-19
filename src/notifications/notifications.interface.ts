import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class NewNotification {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  groups: number[];

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  @IsOptional()
  doLinkPreview: boolean;
}
