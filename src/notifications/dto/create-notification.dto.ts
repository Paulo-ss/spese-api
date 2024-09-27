import { IsEnum, IsNumber, IsString } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @IsNumber()
  public userId: number;

  @IsEnum(NotificationType)
  public type: NotificationType;

  @IsString()
  public title: string;

  @IsString()
  public content: string;

  @IsNumber()
  public referenceId: number;
}
