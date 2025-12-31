import { Logger } from '@nestjs/common';
import { ISubscriber } from '../../interfaces/subscriber.interface';
import { StreamName, GroupName } from 'src/async-worker/types/redis';
import { IGroupConfig } from 'src/async-worker/interfaces/group-config.interface';
import { v4 } from 'uuid';
import { IBaseMessage } from 'src/async-worker/types/messages';

export abstract class BaseSubscriber<TMessage extends IBaseMessage>
  implements ISubscriber<TMessage>
{
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  abstract groupName: GroupName;

  abstract getStreamName(): StreamName;

  abstract onMessage(message: TMessage): Promise<void>;

  get consumerName(): string {
    return v4();
  }

  get totalConsumers(): number {
    return 1;
  }

  getGroupConfig(): IGroupConfig {
    return {
      count: 10, // grabs at most 10 messages at a time
      block: 1000 * 60 * 60, // blocks up to 60 minutes if there are no new messages on the stream
    };
  }

  onError(
    error: Error,
    channel: string,
    messagePayload: TMessage | string,
  ): void {
    this.logger.error(
      `Error processing message from channel ${channel}. The message payload is: ${messagePayload}`,
      error.stack,
    );
  }
}
