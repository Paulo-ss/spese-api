import {
  Controller,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Put,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { Observable, concat, from, map } from 'rxjs';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { NotificationsDBService } from './notifications-db.service';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';

@UseGuards(IsAuthenticatedGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notifcationDBService: NotificationsDBService,
  ) {}

  @Sse('count')
  public countUnreadNotifications(
    @CurrentUser() userId: number,
  ): Observable<MessageEvent> {
    return concat(
      from(
        this.notifcationDBService.getUnreadNotificationsCountByUser(userId),
      ).pipe(map((count) => ({ data: { unreadCount: count } }))),
      this.notificationsService
        .subscribe(`${userId}.notify`)
        .pipe(
          map((notification) => ({ data: { unreadCount: 1, notification } })),
        ),
    );
  }

  @Get('user')
  public async getNotificationsByUser(@CurrentUser() userId: number) {
    return this.notifcationDBService.findByUserId(userId);
  }

  @Put(':id')
  public async markNotificationAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IGenericMessageResponse> {
    return this.notifcationDBService.markNotificationAsRead(id);
  }
}
