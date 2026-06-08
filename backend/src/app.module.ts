import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { VehiculesModule } from './modules/vehicules/vehicules.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';

@Module({
  imports: [AuthModule, IncidentsModule, VehiculesModule, PrismaModule, DispatchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
