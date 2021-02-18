import { Module } from '@nestjs/common';
import { PrepareController } from './prepare.controller';
import { PrepareService } from './prepare.service';
import { EventsModule } from '../events/events.module';
import { AttendessModule } from '../attendess/attendess.module';

@Module({
  controllers: [PrepareController],
  providers: [PrepareService],
  imports:[EventsModule, AttendessModule]
})
export class PrepareModule {}
