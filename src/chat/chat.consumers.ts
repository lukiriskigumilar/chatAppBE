import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatConsumer {
  constructor(private readonly chatGateway: ChatGateway) {}

  @RabbitSubscribe({
    exchange: 'chat_exchange',
    routingKey: 'chat.send',
    queue: 'chat_queue',
  })
  public handleChatMessage(msg: {
    chatId: string;
    senderUsername: string;
    receiverUsername: string;
    content: string;
    dateTime: string;
  }) {
    this.chatGateway.broadcastChat(msg);
  }
}
