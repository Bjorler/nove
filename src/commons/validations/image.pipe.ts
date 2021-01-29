import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ImageGuard implements CanActivate{
    canActivate(context: ExecutionContext):boolean{
        const req = context.switchToHttp().getRequest();
        console.log(req);
        return true;
    }
}