import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatConsumer } from './chat.consumers';
import { Chat, ChatSchema } from './schemas/chat.schemas';
import { UserModule } from 'src/users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    UserModule,
    RabbitMQModule.forRoot({
      exchanges: [{ name: process.env.CHAT_EXCHANGE || '', type: 'direct' }],
      uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [ChatService, ChatGateway, ChatConsumer],
  controllers: [ChatController],
})
export class ChatModule {}
