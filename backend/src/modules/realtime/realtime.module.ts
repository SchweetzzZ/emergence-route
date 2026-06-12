import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || process.env.jwtSecret || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
