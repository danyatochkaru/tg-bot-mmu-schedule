import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MediaPayload {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  @IsOptional()
  isSpoiler?: boolean;
}

export class NewNotification {
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

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => MediaPayload)
  media?: MediaPayload[];
}
