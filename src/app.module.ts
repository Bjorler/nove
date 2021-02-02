import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { JwtModule } from '@nestjs/jwt'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HOST, USER, PASSWORD, DATABASE, SECRET } from './config';
import { AuthenticateModule } from './authenticate/authenticate.module';
import { EventsModule } from './events/events.module';
import { AttendessModule } from './attendess/attendess.module';


@Module({
  imports: [
    KnexModule.forRoot({
      config:{
        client:'mysql',
        connection:{
          host:HOST,
          user:USER,
          password:PASSWORD,
          database:DATABASE
        }
      }
    }),
    JwtModule.register({
      secret: SECRET
    }),
    UsersModule,
    AuthenticateModule,
    EventsModule,
    AttendessModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
