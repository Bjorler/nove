import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttendessModule } from '../attendess/attendess.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { LogServices } from '../commons/services/log.service';
import { SECRET } from '../config';

@Module({
  controllers: [EventsController],
  providers: [EventsService, LogServices],
  imports:[
    JwtModule.register({secret:SECRET}),
    forwardRef(()=> AttendessModule)
  ],
  exports:[EventsService]
})
export class EventsModule {}
