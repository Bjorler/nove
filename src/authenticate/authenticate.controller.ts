import { Controller, Post, Body, HttpException, HttpStatus, UsePipes } from '@nestjs/common';
import { ApiTags, ApiNotFoundResponse, ApiResponse, ApiInternalServerErrorResponse, ApiOperation } from '@nestjs/swagger';
import { AuthenticateService } from './authenticate.service';
import { LogServices } from '../commons/services/log.service';
import { ValidationPipe } from '../commons/validations/validations.pipe';
import { AutehenticateDto } from './DTO/authenticate.dto';
import { ResponseDto, ResultDto } from './DTO/response.dto';
import { ErrorDto, NotFoundDto,InternalServerErrrorDto, LogDto } from '../commons/DTO';
import { METHOD, DOMAIN, PORT } from '../config';

@ApiTags("Authenticate")
@Controller('authenticate')
export class AuthenticateController {
    constructor(
        private authService: AuthenticateService,
        private logService: LogServices
    ){}


    @Post()
    @ApiOperation({summary:"Api to login"})
    @ApiNotFoundResponse({
        description: "USER NOT FOUND",
        type: NotFoundDto
    })
    @ApiResponse({
        status:201,
        type:ResponseDto
    })
    @ApiResponse({
        status:400,
        type:ErrorDto,
        description:"Validation failed",
    })
    @ApiInternalServerErrorResponse({
        description:"Internal server error",
        type:InternalServerErrrorDto
    })
    @UsePipes(new ValidationPipe)
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
        result.download_img = `${METHOD}://${DOMAIN}:${PORT}/users/image/${user.id}`

        let response = new ResponseDto();
        response.message = "Token Provided";
        response.result = result;
        
        return response
        
    }
}
