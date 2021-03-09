import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from '../events/events.module';
import { DatabaseModule } from '../database/database.module';
import { AttendessController } from './attendess.controller';
import { AttendessService } from './attendess.service';
import { EmailServices } from '../commons/services/email.service';
import { LogServices } from '../commons/services/log.service';
import { SECRET } from '../config';

@Module({
  controllers: [AttendessController],
  providers: [AttendessService, LogServices, EmailServices],
  imports:[ JwtModule.register({ secret:SECRET }), 
    forwardRef(()=>EventsModule), 
    HttpModule, 
    forwardRef(()=>DatabaseModule) ],
  exports: [ AttendessService ]
})
export class AttendessModule {}
