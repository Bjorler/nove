import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectKnex , Knex } from 'nestjs-knex';
@Injectable()
export class TokenGuard implements CanActivate{

    constructor(
        private jwt:JwtService,
        @InjectKnex() private knex: Knex
    ){}

    async canActivate( ctx: ExecutionContext ):Promise<boolean>{
        const req = ctx.switchToHttp().getRequest();
        const { headers } = req;
        if(!headers.token) throw new HttpException("MISSING token", HttpStatus.UNAUTHORIZED);
        const decode = this.jwt.decode(headers.token)
        
        //@ts-ignore
        const user = await this.knex.table("users").where({id:decode.id})
        if(!user.length) throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);

        
        req.user = decode;
        
        return true;
    }
}
