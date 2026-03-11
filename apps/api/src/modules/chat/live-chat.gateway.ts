import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

const MAX_MESSAGES = 100; // 최대 100개 저장

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/live-chat',
})
export class LiveChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  handleConnection(client: Socket) {
    console.log(`클라이언트 연결: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`클라이언트 연결 해제: ${client.id}`);
  }

  @SubscribeMessage('joinMatch')
  async handleJoinMatch(
    @MessageBody() matchId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`match:${matchId}`);

    // 이전 메시지 불러와서 전송
    const messages = await this.getMessages(matchId);
    client.emit('previousMessages', messages);
    client.emit('joined', { matchId });
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(
    @MessageBody() matchId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`match:${matchId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      matchId: string;
      userId: string;
      username: string;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const payload = {
      id: Date.now().toString(),
      userId: data.userId,
      username: data.username,
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    // Redis에 저장
    await this.saveMessage(data.matchId, payload);

    this.server.to(`match:${data.matchId}`).emit('newMessage', payload);
  }

  private async getMessages(matchId: string) {
    const key = `live-chat:${matchId}`;
    const messages = await this.cacheManager.get<any[]>(key);
    return messages ?? [];
  }

  private async saveMessage(matchId: string, message: any) {
    const key = `live-chat:${matchId}`;
    const messages = await this.getMessages(matchId);
    messages.push(message);

    // 최대 100개만 유지
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    // 7일 보관
    await this.cacheManager.set(key, messages, 60 * 60 * 24 * 7);
  }
}
