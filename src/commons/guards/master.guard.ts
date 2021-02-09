import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesDto } from '../DTO/roles.dto';


@Injectable()
export class MasterGuard implements CanActivate{
    
    constructor(
        private reflector: Reflector
    ){}

    canActivate(ctx: ExecutionContext){
        const req = ctx.switchToHttp().getRequest();
        if(!req.user) throw new HttpException("MISSING token", HttpStatus.UNAUTHORIZED);

        const path = req.path.replace("/","").split("/")[1]
        

        const roles = new Set(this.reflector.get("roles", ctx.getHandler()))
        const permission = this.reflector.get('permission', ctx.getHandler())

        
        const role = RolesDto[req.user.role_id]
        if(!roles.has(role)) throw new HttpException("ACCESS DENIED", HttpStatus.FORBIDDEN)
        if(!req.user.permissions[path].toLowerCase().includes(permission.toString().toLowerCase())) throw new HttpException("ACCESS DENIED", HttpStatus.FORBIDDEN)
        
        return true;
    }
}