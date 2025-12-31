import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IConsumer } from '../interfaces/consumer.interface';
import { RedisConnection } from '../connection/redis-connection';
import { GroupName, StreamMessages, StreamName } from '../types/redis';
import { ASYNC_WORKER } from 'src/common/constants/constants';
import { IGroupConfig } from '../interfaces/group-config.interface';

export class RedisConsumer<T>
  implements IConsumer, OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(RedisConsumer.name);
  private readonly existingGroups: Set<GroupName> = new Set();
  private isRunning: boolean = true;
  private lastSuccessfullMessageId: string | null = null;
  private nextEntryId: string | null = null;
  private checkBacklog: boolean = true;

  constructor(
    private readonly redisConnection: RedisConnection,
    private readonly streamName: StreamName,
    private readonly groupName: GroupName,
    private readonly consumerName: string,
    private readonly onMessage: (message: T) => Promise<void>,
    private readonly groupConfig: IGroupConfig,
  ) {}

  private async getNextMessageListBlocking(
    startingEntryId: string,
  ): Promise<StreamMessages[]> {
    try {
      const messages = await this.redisConnection.redis.xReadGroup(
        this.groupName,
        this.consumerName,
        { key: this.streamName, id: startingEntryId },
        { COUNT: this.groupConfig.count, BLOCK: this.groupConfig.block },
      );

      return messages;
    } catch (error) {
      this.logger.error(
        `Error polling messages from stream ${this.streamName}, returning empty list. The error is: `,
        error,
      );

      if (error instanceof Error && error.message.includes('NOGROUP')) {
        this.existingGroups.clear();
        await this.ensureGroupExists(true);
      }

      return [];
    }
  }

  private async ackMessage(lastProcessedMessageId: string) {
    try {
      console.log('HERE');
      const ackResponse = await this.redisConnection.redis.xAck(
        this.streamName,
        this.groupName,
        lastProcessedMessageId,
      );

      if (ackResponse === ASYNC_WORKER.ACK_SUCCESS) {
        this.lastSuccessfullMessageId = lastProcessedMessageId;
      }
    } catch (error) {
      this.logger.error(
        `Failed to ack message ${lastProcessedMessageId} from stream ${this.streamName}, skipping. The error is: `,
        error,
      );
    }
  }

  private async ensureGroupExists(recover: boolean = false) {
    try {
      if (!this.existingGroups.has(this.groupName)) {
        await this.redisConnection.redis.xGroupCreate(
          this.streamName,
          this.groupName,
          recover && this.lastSuccessfullMessageId
            ? this.lastSuccessfullMessageId
            : ASYNC_WORKER.REDIS_ENTRY_IDS.PENDING_ENTRY,
          { MKSTREAM: true },
        );

        this.existingGroups.add(this.groupName);
      }
    } catch {
      this.existingGroups.add(this.groupName);
    }
  }

  private async processMessages(startingEntryId: string) {
    const messages = await this.getNextMessageListBlocking(startingEntryId);
    if (!messages || messages.length === 0) {
      return;
    }

    const streamMessages = messages.find(
      (message) => message.name === this.streamName,
    );
    if (!streamMessages) {
      return;
    }

    if (streamMessages.messages.length === 0) {
      this.checkBacklog = false;
      return;
    }

    for (const { id, message } of streamMessages.messages) {
      try {
        const parsedMessage = JSON.parse(message['data']) as T;
        await this.onMessage(parsedMessage);
        await this.ackMessage(id);
      } catch (error) {
        this.logger.error(
          `Error processing message ${id} with content ${message} from stream ${this.streamName}, skipping. The error is:`,
          error,
        );
      }
    }
  }

  async start() {
    this.logger.log(
      `Consumer for stream ${this.streamName} started. Group: ${this.groupName}. Consumer: ${this.consumerName}`,
    );

    while (this.isRunning) {
      try {
        await this.ensureGroupExists();

        if (this.checkBacklog) {
          this.nextEntryId =
            this.lastSuccessfullMessageId ??
            ASYNC_WORKER.REDIS_ENTRY_IDS.PENDING_ENTRY;
        } else {
          this.nextEntryId = ASYNC_WORKER.REDIS_ENTRY_IDS.UNRECEIVED_ENTRY;
        }

        await this.processMessages(this.nextEntryId);
      } catch (error) {
        this.logger.error(
          `Error processing messages from stream ${this.streamName}, skipping. The error is:`,
          error,
        );
      }
    }
  }

  async stop() {
    this.isRunning = false;
    this.lastSuccessfullMessageId = null;
    this.nextEntryId = null;
    this.checkBacklog = true;

    this.existingGroups.clear();
    this.logger.log(
      `Consumer for stream ${this.streamName} stopped. Group: ${this.groupName}. Consumer: ${this.consumerName}`,
    );
  }

  async onModuleInit() {
    await this.start();
  }

  async onModuleDestroy() {
    await this.stop();
  }
}
