import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId =
      client.handshake.auth.userId || client.handshake.query.userId;

    if (userId) {
      if (!this.userSockets.has(userId as string)) {
        this.userSockets.set(userId as string, new Set());
      }
      this.userSockets.get(userId as string)?.add(client.id);
    } else {
      console.log(`⚠️  Client connected without userId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId =
      client.handshake.auth.userId || client.handshake.query.userId;

    if (userId) {
      this.userSockets.get(userId as string)?.delete(client.id);
      if (this.userSockets.get(userId as string)?.size === 0) {
        this.userSockets.delete(userId as string);
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }

  sendUnreadCountToUser(userId: string, count: number) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('unread-count', count);
      });
    }
  }
}
