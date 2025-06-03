import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { ConnectedClients } from './interfaces/connected-clients.interface';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class MessageWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>) {}

    async registerClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        //console.log({ user });
        
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.isActive) {
            throw new Error('User is no active');
        }

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
}

