import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private items: string[] = []; // Array compartilhado

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);

    // Enviar o array atual para o cliente recém-conectado
    client.emit('update_array', this.items);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('add_item')
  handleAddItem(@MessageBody() item: string) {
    this.items.push(item); // Adicionar item ao array
    console.log(`Novo item adicionado: ${item}`);

    // Enviar o array atualizado para todos os clientes conectados
    this.server.emit('update_array', this.items);
  }

  @SubscribeMessage('remove_item')
  handleRemoveItem(@MessageBody() index: number) {
    if (index >= 0 && index < this.items.length) {
      const removed = this.items.splice(index, 1);
      console.log(`Item removido: ${removed}`);

      // Enviar o array atualizado para todos os clientes conectados
      this.server.emit('update_array', this.items);
    }
  }
}
