import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { sendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(
    @Req() req: { user: { userId: string; userName: string } },
    @Body() dto: sendMessageDto,
  ) {
    const senderId = req.user.userId;
    const senderUsername = req.user.userName;
    console.log(senderUsername);
    console.log(senderId);
    return this.chatService.SendMessage(senderId, senderUsername, dto);
  }
}
