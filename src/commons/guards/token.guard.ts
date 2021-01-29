import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class TokenGuard implements CanActivate{

    constructor(
        private jwt:JwtService
    ){}

    canActivate( ctx: ExecutionContext ):boolean{
        const req = ctx.switchToHttp().getRequest();
        const { headers } = req;
        if(!headers.token) throw new HttpException("MISSING token", HttpStatus.UNAUTHORIZED);
        const decode = this.jwt.decode(headers.token)
        req.user = decode;
        
        return true;
    }
}
