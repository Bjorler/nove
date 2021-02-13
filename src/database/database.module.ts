import { Module, HttpModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { LogServices } from '../commons/services/log.service';
import { SECRET } from '../config';
@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService, LogServices], 
  exports: [DatabaseService],
  imports: [JwtModule.register({secret:SECRET}), HttpModule]
})
export class DatabaseModule {}
