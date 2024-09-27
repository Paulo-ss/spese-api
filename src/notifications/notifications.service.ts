import { Injectable } from '@nestjs/common';
import { fromEvent } from 'rxjs';
import { EventEmitter } from 'stream';
import { INotification } from './interfaces/notification.interface';

@Injectable()
export class NotificationsService {
  private readonly emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public subscribe(channel: string) {
    return fromEvent(this.emitter, channel);
  }

  public async emit(channel: string, notification: INotification) {
    this.emitter.emit(channel, notification);
  }
}