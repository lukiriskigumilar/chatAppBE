import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from './schemas/chat.schemas';
import { UserService } from '../users/users.service';
import { sendMessageDto } from './dto/send-message.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { NotFoundException } from '@nestjs/common';
import { format } from 'date-fns';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private readonly userService: UserService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  //save chat and send to RabbitMq for worker
  async SendMessage(
    senderId: string,
    senderUsername: string,
    dto: sendMessageDto,
  ) {
    const receiverUser = await this.userService.findByUsername(
      dto.receiverUsername,
    );
    if (!receiverUser) {
      throw new NotFoundException('Receiver user not found');
    }
    // save chat to db
    const chat = new this.chatModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverUser._id),
      content: dto.content,
    });

    const savedChat = await chat.save();

    const now: Date = new Date();
    const sentDate = format(now, 'dd MM yy HH:mm');

    // Send message to RabbitMQ
    await this.amqpConnection.publish('chat_exchange', 'chat.send', {
      chatId: savedChat._id,
      senderUsername,
      receiverUser: dto.receiverUsername,
      content: dto.content,
      dateTime: sentDate,
    });
    return {
      message: `success send message to ${dto.receiverUsername}`,
    };
  }
}
