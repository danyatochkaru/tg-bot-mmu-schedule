import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { AppEvent } from '../entities/webhook.entity';

export class UpdateWebhookDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  event?: AppEvent;
  @IsString()
  @IsUrl()
  @IsOptional()
  url?: string;
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
