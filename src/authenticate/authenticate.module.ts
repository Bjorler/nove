import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticateController } from './authenticate.controller';
import { AuthenticateService } from './authenticate.service';
import { LogServices } from '../commons/services/log.service';
import { UsersModule } from '../users/users.module';
import { SECRET } from '../config';

@Module({
  controllers: [AuthenticateController],
  providers: [AuthenticateService, LogServices],
  imports: [ 
    JwtModule.register({secret:SECRET}),
    UsersModule ]
})
export class AuthenticateModule {}
