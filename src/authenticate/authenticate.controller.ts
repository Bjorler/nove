import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticateService } from './authenticate.service';
import { LogServices } from '../commons/services/log.service';
import { AutehenticateDto } from './DTO/authenticate.dto';
import { ResponseDto, ResultDto } from './DTO/response.dto';
import {  LogDto } from '../commons/DTO';
import { AuthenticationDecorator } from './decorators/authenticate.decorator';
import { METHOD, DOMAIN } from '../config';

@ApiTags("Authenticate")
@Controller('authenticate')
export class AuthenticateController {
    constructor(
        private authService: AuthenticateService,
        private logService: LogServices
    ){}


    @Post()
    @AuthenticationDecorator()
    async authenticate( @Body() authenticate: AutehenticateDto){
        const users = await this.authService.findByEmail(authenticate.email);
        if(!users.length) throw new HttpException("USER NOT FOUND", HttpStatus.NOT_FOUND);
        
        const user = await this.authService.findUser(users, authenticate.password);
        if(!user) throw new HttpException("USER NOT FOUND", HttpStatus.NOT_FOUND);
        
        const token = this.authService.generateJWT(Object.assign({}, user));
        await this.authService.lastLogin(user.id)

        /** CREATE LOG  */
        const log = new LogDto();
        log.new_change = "login";
        log.type = "login";
        log.element = user.id;
        log.db_table = "users";
        log.created_by = user.id;
        log.modified_by = user.id;
        await this.logService.createLog(log);

        let result = new ResultDto();
        result.token = token;
        result.role_id = user.role_id
        result.permissions = user.permissions;
        result.username = `${user.name} ${user.apellido_paterno}`;
        result.role = user.role_name.replace(user.role_name[0],user.role_name.substr(0,1).toUpperCase());
        result.download_img = `${METHOD}://${DOMAIN}/users/image/${user.id}`

        let response = new ResponseDto();
        response.message = "Token Provided";
        response.result = result;
        
        return response
        
    }
}
