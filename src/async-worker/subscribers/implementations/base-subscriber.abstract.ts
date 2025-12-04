import { Logger } from '@nestjs/common';
import { ISubscriber } from '../../interfaces/subscriber.interface';
import {
  StreamName,
  RedisMessage,
  GroupName,
} from 'src/async-worker/types/messages-definition';
import { IGroupConfig } from 'src/async-worker/interfaces/group-config.interface';

export abstract class BaseSubscriber implements ISubscriber {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  abstract groupName: GroupName;

  abstract consumerName: string;

  abstract getStreamName(): StreamName;

  abstract onMessage(message: RedisMessage<StreamName>): Promise<void>;

  getGroupConfig(): IGroupConfig {
    return {
      count: 10, // grabs at most 10 messages at a time
      block: 5000, // block form 5s if there are no new messages on the stream
    };
  }

  onSubscribed(channel: string): void {
    this.logger.log(`Successfully subscribed to channel: ${channel}`);
  }

  onError(
    error: Error,
    channel: string,
    messagePayload: RedisMessage<StreamName> | string,
  ): void {
    this.logger.error(
      `Error processing message from channel ${channel}. The message payload is: ${messagePayload}`,
      error.stack,
    );
  }
}
