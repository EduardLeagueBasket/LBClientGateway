import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
//import { envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
          maxPayload: 10 * 1024 * 1024, // 10MB
        },
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
          maxPayload: 10 * 1024 * 1024, // 10MB
        },
      },
    ]),
  ],
})
export class NatsModule {}
