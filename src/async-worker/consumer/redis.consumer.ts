import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IConsumer } from '../interfaces/consumer.interface';
import { RedisConnection } from '../connection/redis-connection';
import {
  GroupName,
  RedisMessage,
  StreamEntryId,
  StreamMessages,
  StreamName,
} from '../types/messages-definition';
import { ASYNC_WORKER } from 'src/common/constants/constants';
import { IGroupConfig } from '../interfaces/group-config.interface';

export class RedisConsumer implements IConsumer, OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(RedisConsumer.name);
  private readonly existingGroups: Set<GroupName> = new Set();
  private isRunning: boolean = true;
  private lastSuccessfullMessageId: string | null = null;

  constructor(
    private readonly redisConnection: RedisConnection,
    private readonly streamName: StreamName,
    private readonly groupName: GroupName,
    private readonly consumerName: string,
    private readonly onMessage: (
      message: RedisMessage<StreamName>,
    ) => Promise<void>,
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

  private async ackMessages(lastProcessedMessageId: string) {
    const ackResponse = await this.redisConnection.redis.xAck(
      this.streamName,
      this.groupName,
      lastProcessedMessageId,
    );

    if (ackResponse === ASYNC_WORKER.ACK_SUCCESS) {
      this.lastSuccessfullMessageId = lastProcessedMessageId;
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

  private async processMessages(startingEntryId: StreamEntryId) {
    const messages = await this.getNextMessageListBlocking(startingEntryId);
    if (messages.length === 0) {
      return;
    }

    const streamMessages = messages.find(
      (message) => message.name === this.streamName,
    );
    if (!streamMessages) {
      return;
    }

    for (const { id, message } of streamMessages.messages) {
      try {
        const parsedMessage = JSON.parse(
          message['data'],
        ) as RedisMessage<StreamName>;
        await this.onMessage(parsedMessage);
        await this.ackMessages(id);
      } catch (error) {
        this.logger.error(
          `Error processing message ${id} from stream ${this.streamName}, skipping. The error is:`,
          error,
        );
      }
    }
  }

  async start() {
    while (this.isRunning) {
      try {
        await this.ensureGroupExists();
        await this.processMessages(ASYNC_WORKER.REDIS_ENTRY_IDS.PENDING_ENTRY);
        await this.processMessages(
          ASYNC_WORKER.REDIS_ENTRY_IDS.UNRECEIVED_ENTRY,
        );
      } catch (error) {}
    }
  }

  async stop() {
    this.isRunning = false;
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
