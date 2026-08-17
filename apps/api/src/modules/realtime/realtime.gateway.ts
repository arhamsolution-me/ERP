import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // Assuming JWT guard exists

@WebSocketGateway({
  cors: {
    origin: '*', // Should be restricted in production
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Connection handshake: Verify JWT Token here in production
  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    
    if (!token) {
      client.disconnect(true);
      return;
    }

    // TODO: Verify JWT Token and extract tenant_id / user_id
    // If invalid, client.disconnect(true);
    
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Example subscription room. 
  // CRITICAL: We do NOT trust the client. We must verify the client's decoded JWT matches the requested tenantId.
  @SubscribeMessage('subscribeToRoom')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string; room: string }
  ) {
    // SECURITY CHECK:
    // const userTenantId = client.data.user.tenantId;
    // if (userTenantId !== data.tenantId) throw new UnauthorizedException();
    
    const roomName = `tenant:${data.tenantId}:${data.room}`;
    client.join(roomName);
    return { event: 'subscribed', data: roomName };
  }

  @SubscribeMessage('unsubscribeFromRoom')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string; room: string }
  ) {
    const roomName = `tenant:${data.tenantId}:${data.room}`;
    client.leave(roomName);
    return { event: 'unsubscribed', data: roomName };
  }
}
