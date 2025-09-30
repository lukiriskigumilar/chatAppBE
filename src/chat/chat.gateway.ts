import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';

interface JwtPayload {
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private readonly jwtService: JwtService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const cookies = client.handshake.headers.cookie;
    if (!cookies) {
      client.disconnect();

      //TODO:delete this console
      console.log('cookie not include');
      return;
    }
    try {
      const parsed = cookie.parse(cookies);
      const token = parsed['Auth'] as string;
      const payload = this.jwtService.verify<JwtPayload>(token);
      const username = payload.username;
      void client.join(username);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      client.disconnect();
      //TODO: delete this console
      console.log('cookie not valid' + err);
    }
  }

  //broadcast chat ke receiver
  broadcastChat(msg: {
    chatId: string;
    senderUsername: string;
    receiverUsername: string;
    content: string;
    dateTime: string;
  }) {
    this.server.to(msg.receiverUsername).emit('newReceivedMessage', msg);
    if (msg.senderUsername !== msg.receiverUsername) {
      this.server.to(msg.senderUsername).emit('newSentMessage', msg);
    }
  }
}
