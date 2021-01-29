import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LogServices } from '../commons/services/log.service';
import { SECRET } from '../config';
@Module({
  controllers: [UsersController],
  providers: [UsersService, LogServices],
  exports:[UsersService],
  imports:[
    JwtModule.register({secret:SECRET})
  ]
})
export class UsersModule {}
