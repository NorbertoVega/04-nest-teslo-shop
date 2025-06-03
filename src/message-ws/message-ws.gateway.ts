import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';


@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
    } 
    catch (error) {
      client.disconnect();
      return;  
    }

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado:', client.id);
    this.messageWsService.removeClient(client.id);
    //console.log({ conectados: this.messageWsService.getConnectedClients() });
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClientToEveryone(client: Socket, payload: NewMessageDto) {
    // Emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!'
    });
  }

  @SubscribeMessage('message-from-client-to-itself')
  onMessageFromClientToItself(client: Socket, payload: NewMessageDto) {
    // Emite al cliente que envio el mensaje, no a todos
    client.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no-message!!'
    });
  }

  @SubscribeMessage('message-from-client-to-everyone-but-itself')
  onMessageFromClientToEveryoneBuItself(client: Socket, payload: NewMessageDto) {
    // Emitir a todos menos al que envio el mensaje
    client.broadcast.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no-message!!'
    });
  }

  @SubscribeMessage('message-from-client-to-sales')
  onMessageToClientToSales(client: Socket, payload: NewMessageDto) {
    client.join('ventas');
    this.wss.to('ventas').emit(payload.message);
  }

}
