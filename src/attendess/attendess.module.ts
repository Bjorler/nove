import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from '../events/events.module';
import { AttendessController } from './attendess.controller';
import { AttendessService } from './attendess.service';
import { LogServices } from '../commons/services/log.service';
import { SECRET } from '../config';
import { from } from 'rxjs';
@Module({
  controllers: [AttendessController],
  providers: [AttendessService, LogServices],
  imports:[ JwtModule.register({ secret:SECRET }), EventsModule ]
})
export class AttendessModule {}
