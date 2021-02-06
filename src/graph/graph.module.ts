import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from '../events/events.module';
import { AttendessModule } from '../attendess/attendess.module';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';
import { SECRET } from '../config';
@Module({
  controllers: [GraphController],
  providers: [GraphService],
  imports:[EventsModule,JwtModule.register({secret:SECRET}), AttendessModule]
})
export class GraphModule {}
