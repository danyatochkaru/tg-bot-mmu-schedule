import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class NewNotification {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  groups: number[];

  @IsString()
  @IsNotEmpty()
  text: string;
}
