import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { AppEvent } from '../entities/webhook.entity';

export class CreateWebhookDto {
  @IsString()
  @IsNotEmpty()
  event: AppEvent;
  @IsString()
  @IsUrl()
  url: string;
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
