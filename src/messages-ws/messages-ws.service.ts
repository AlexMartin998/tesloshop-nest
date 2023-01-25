import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { JwtPayload } from './../auth/interfaces/jwt-payload.interface';
import { ConnectedClients } from './interfaces';

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User nor active');

    this.checkUserConnection(user);

    this.connectedClients[client.id] = { socket: client, user };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }

  //
  getJwtPayload(jwt: string, client: Socket) {
    let payload: JwtPayload;

    try {
      return (payload = this.jwtService.verify(jwt));
    } catch (error) {
      client.disconnect();
      return;
    }
  }
}
