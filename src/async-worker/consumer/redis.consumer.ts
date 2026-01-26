import { Logger } from '@nestjs/common';
import { IConsumer } from '../interfaces/consumer.interface';
import { RedisConnection } from '../connection/redis-connection';
import { GroupName, StreamMessages, StreamName } from '../types/redis';
import { ASYNC_WORKER } from 'src/common/constants/constants';
import { IGroupConfig } from '../interfaces/group-config.interface';
import { ClsService } from 'nestjs-cls';
import {
    isEmpty,
    isNullOrUndefined,
} from '../../common/utils/validation.utils';

export class RedisConsumer<T> implements IConsumer {
    private readonly logger: Logger = new Logger(RedisConsumer.name);
    private readonly existingGroups: Set<GroupName> = new Set();
    private isRunning: boolean = true;
    private lastSuccessfulMessageId: string | null = null;

    constructor(
        private readonly redisConnection: RedisConnection,
        private readonly streamName: StreamName,
        private readonly groupName: GroupName,
        private readonly consumerName: string,
        private readonly onMessage: (message: T) => Promise<void>,
        private readonly groupConfig: IGroupConfig,
        private readonly clsService: ClsService,
    ) {}

    private async getNextMessageListBlocking(
        entryId: string,
    ): Promise<StreamMessages[]> {
        try {
            return await this.redisConnection.redis.xReadGroup(
                this.groupName,
                this.consumerName,
                { key: this.streamName, id: entryId },
                {
                    COUNT: this.groupConfig.count,
                    BLOCK: this.groupConfig.block,
                },
            );
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

    private async trimMessagesExceedingRetries(
        streamMessages: StreamMessages,
    ): Promise<StreamMessages> {
        const { messages } = streamMessages;
        if (isEmpty(messages)) {
            return streamMessages;
        }

        const fromEntry = messages.at(0).id;
        const toEntry = messages.at(-1).id;

        const pending = await this.redisConnection.redis.xPendingRange(
            this.streamName,
            this.groupName,
            fromEntry,
            toEntry,
            1,
        );

        if (isEmpty(pending)) {
            return streamMessages;
        }

        const messagesIdsExceedingRetries: string[] = [];

        for (const { deliveriesCounter, id } of pending) {
            if (deliveriesCounter > ASYNC_WORKER.REDIS_MAX_RETRIES) {
                messagesIdsExceedingRetries.push(id);
            }
        }

        if (isEmpty(messagesIdsExceedingRetries)) {
            return streamMessages;
        }

        const deletedCount = await this.redisConnection.redis.xAck(
            this.streamName,
            this.groupName,
            messagesIdsExceedingRetries,
        );

        const pipeline = this.redisConnection.redis.multi();

        messages
            .filter(({ id }) => messagesIdsExceedingRetries.includes(id))
            .forEach((message) => {
                const serializedMessage = JSON.stringify(message);

                pipeline.xAdd(
                    ASYNC_WORKER.REDIS_STREAMS.DEAD_LETTER_QUEUE,
                    '*',
                    {
                        data: serializedMessage,
                    },
                    {
                        TRIM: {
                            strategy: 'MAXLEN',
                            threshold: 100,
                            strategyModifier: '~',
                        },
                    },
                );
            });

        await pipeline.exec();

        this.logger.warn(
            `Messages ${messagesIdsExceedingRetries.join(', ')} from stream ${this.streamName} / group ${this.groupName} / consumer ${this.consumerName} reached maximum retries. Acked ${deletedCount} messages and moved them to DLQ for manual inspection.`,
        );

        return {
            name: streamMessages.name,
            messages: messages.filter(
                ({ id }) => !messagesIdsExceedingRetries.includes(id),
            ),
        };
    }

    private async ackMessage(lastProcessedMessageId: string) {
        try {
            const ackResponse = await this.redisConnection.redis.xAck(
                this.streamName,
                this.groupName,
                lastProcessedMessageId,
            );

            if (ackResponse === ASYNC_WORKER.REDIS_ACK_SUCCESS) {
                this.lastSuccessfulMessageId = lastProcessedMessageId;
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
                    recover && this.lastSuccessfulMessageId
                        ? this.lastSuccessfulMessageId
                        : ASYNC_WORKER.REDIS_ENTRY_IDS.PENDING_ENTRY,
                    { MKSTREAM: true },
                );

                this.existingGroups.add(this.groupName);
            }
        } catch {
            this.existingGroups.add(this.groupName);
        }
    }

    private async processMessages(entryId: string) {
        this.logger.debug(
            `Processing message for stream ${this.streamName} / group ${this.groupName} / consumer ${this.consumerName} / entryId ${entryId}`,
        );

        const messages = await this.getNextMessageListBlocking(entryId);
        if (isNullOrUndefined(messages) || isEmpty(messages)) {
            return;
        }

        let streamMessages = messages.find(
            (message) => message.name === this.streamName,
        );
        if (isNullOrUndefined(streamMessages)) {
            return;
        }

        if (entryId === ASYNC_WORKER.REDIS_ENTRY_IDS.PENDING_ENTRY) {
            streamMessages =
                await this.trimMessagesExceedingRetries(streamMessages);
        }

        for (const { id, message } of streamMessages.messages) {
            const parsedMessage = JSON.parse(message['data']) as T;

            /*
             * Run the message processing in a new cls context so we can decorate
             * each subscriber `onMessage()` method with `@Transactional()`,
             * so we ensure that on every message processing, ALL the operations
             * must be successful, otherwise, we roll back every single operation,
             * ensuring consistency, and the message will be able to be properly
             * reprocessed on the next iteration
             */
            await this.clsService.run(async () => {
                return await this.onMessage(parsedMessage);
            });

            await this.ackMessage(id);
        }
    }

    async start() {
        this.logger.log(
            `Consumer for stream ${this.streamName} started. Group: ${this.groupName}. Consumer: ${this.consumerName}`,
        );

        while (this.isRunning) {
            try {
                await this.ensureGroupExists();

                await this.processMessages(
                    ASYNC_WORKER.REDIS_ENTRY_IDS.PENDING_ENTRY,
                );
                await this.processMessages(
                    ASYNC_WORKER.REDIS_ENTRY_IDS.UNRECEIVED_ENTRY,
                );
            } catch (error) {
                this.logger.error(
                    `Error processing messages from stream ${this.streamName}, skipping. The error is:`,
                    error,
                );
                this.existingGroups.clear();
            }
        }
    }

    async stop() {
        this.isRunning = false;
        this.lastSuccessfulMessageId = null;

        this.existingGroups.clear();
        this.logger.log(
            `Consumer for stream ${this.streamName} stopped. Group: ${this.groupName}. Consumer: ${this.consumerName}`,
        );
    }
}
