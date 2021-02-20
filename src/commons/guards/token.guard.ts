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
        let decode;
        try{
            decode = this.jwt.verify(headers.token)
        }catch(err){
            throw new HttpException("EXPIRED token", HttpStatus.UNAUTHORIZED);
        }
        
        
        //@ts-ignore
        const user = await this.knex.table("users").where({id:decode.id})
        if(!user.length) throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
        if(user[0]['is_deleted'] == 1) throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
        
        req.user = decode;
        
        return true;
    }
}
