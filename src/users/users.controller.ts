import { Controller, Post, Body, UploadedFile, UseInterceptors, UsePipes, UseGuards, 
    HttpException, HttpStatus, SetMetadata, Get, Query, Param, Response, Put, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiHeader, ApiNotFoundResponse, ApiResponse, ApiUnauthorizedResponse,
        ApiForbiddenResponse, 
        ApiBadRequestResponse,
        ApiInternalServerErrorResponse,
        ApiParam} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ValidationPipe } from '../commons/validations/validations.pipe';
import { UsersService } from './users.service';
import { LogServices } from '../commons/services/log.service';
import { TokenGuard, MasterGuard } from '../commons/guards';
import { User } from '../commons/decoratos/user.decorator';
import { UserDto } from './DTO/user.dto';
import { UsersDto } from './DTO/users.dto';
import { UnauthorizedDto, NotFoundDto, ForbiddenDto, ImageErrorDto, ErrorDto, 
    LogDto, InternalServerErrrorDto, EmailErrorDto, RoleRepatErrorDto, PasswordRepatErrorDto,
    ImageNotFoundDto 
} from '../commons/DTO';
import { RolesDto } from '../commons/DTO/roles.dto';
import { PaginationDto } from './DTO/pagination.dto';
import { UpdateUserDto } from './DTO/updateuser.dto';
import { DeleteUserDto } from './DTO/delete-user.dto';
import { FindUserDto } from './DTO/find-user.dto';
import { UserDetailDto } from './DTO/user-detail.dto';
import { UserResponseDto } from './DTO/user-response.dto';
import { METHOD, DOMAIN, PORT } from '../config';


@ApiTags("Users")
@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
        private logService: LogServices
    ){}

    @Post()
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['C'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:201,type:UserDto})
    @ApiResponse({status:413, type:ImageErrorDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:NotFoundDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    @UseInterceptors(FileInterceptor("avatar",{
        storage:diskStorage({
            destination:path.join(__dirname,'../images'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            const authorized = new Set(["image/png","image/jpeg", 'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }
    }))
    async create(@UploadedFile() avatar, @Body() user:UserDto, @User() session ){
        //console.log(avatar)
        let avatar_name = "", path = "", newUser;
        const userExist = await this.userService.findByEmail(user.email);
        if( avatar ){
            avatar_name = avatar.originalname;
            path = avatar.path;
        }
        if( !userExist.length ){
            const {  hash, salt } = await this.userService.encrypt(user.password);
            let schema = Object.assign({}, user,{
                password: hash, salt, role_id:RolesDto[user.role], avatar:avatar_name, path,
                created_by:session.id, modified_by:session.id, password_length: user.password.length
            })
            newUser = await this.userService.create(schema);
        }else{
            const samePassword = await this.userService.comparePassword(user.password, userExist[0].password)
            const sameRole = userExist[0].role_id == RolesDto[user.role]
            if(!samePassword && !sameRole){
                    const {  hash, salt } = await this.userService.encrypt(user.password);
                    let schema = Object.assign({}, user,{
                        password: hash, salt, role_id:RolesDto[user.role], avatar:avatar_name, path,
                        created_by:session.id, modified_by:session.id, password_length: user.password.length
                    })
                    delete schema.role;
                   newUser = await this.userService.create(schema); 
            }else{ throw new HttpException("User already exist", HttpStatus.BAD_REQUEST) }
            
        }
        let log = new LogDto();
        log.new_change = "create";
        log.type = "create";
        log.element = newUser[0];
        log.db_table = "users";
        log.created_by = session.id;
        log.modified_by = session.id;
        this.logService.createLog(log);
        
        return user
        
    }



    @Get()
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:UserResponseDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    async find(@Query() page:PaginationDto ){
        page.limit = page.limit || 10;
        const pages = await this.userService.pages(page.limit);
        
        const users = await this.userService.findAll(page.limit, page.page)
        let response = new UserResponseDto();
        response.total_pages = pages;
        response.users = users;
        return response;
    }


    @Get('/:id')
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @ApiNotFoundResponse({type:NotFoundDto})
    @ApiResponse({status:200, type:UserDetailDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    async findUser(@Param() id:FindUserDto ){
        
        const user = await this.userService.findById(id.id);
        if(!user.length) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        
        let userDetail = new UserDetailDto();
        userDetail.download_img = `${METHOD}://${DOMAIN}:${PORT}/users/image/${user[0].id}`;
        userDetail.avatar = user[0].avatar;
        userDetail.name = user[0].name;
        userDetail.apellido_paterno = user[0].apellido_paterno;
        userDetail.apellido_materno = user[0].apellido_materno;
        userDetail.email = user[0].email;
        userDetail.password_length = user[0].password_length;
        userDetail.role = RolesDto[user[0].role_id].toLowerCase()
        userDetail.role = userDetail.role.replace(userDetail.role[0] ,userDetail.role.substr(0,1).toUpperCase())
        userDetail.role_id = user[0].role_id
        userDetail.id = user[0].id;
        return userDetail;
    }

    @Get('/image/:id')
    @ApiResponse({status:200, description:"Download image"})
    @ApiNotFoundResponse({type:ImageNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async download(@Response() res ,@Param('id') id:number){
        const user = await this.userService.findById(id);
        if(!user.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = user[0].path;
        res.download(path)
    }


    @Put()
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['U'])
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiNotFoundResponse({type:NotFoundDto})
    @ApiResponse({status:413, type:ImageErrorDto})
    @ApiResponse({status:410, type:EmailErrorDto})
    @ApiResponse({status:411, type:RoleRepatErrorDto})
    @ApiResponse({status:412, type: PasswordRepatErrorDto})
    @ApiResponse({status:200, type:UpdateUserDto, description:"The example is assuming that all the parameters are sent, in case of not sending all it would only return the sent ones."})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    @UseInterceptors(FileInterceptor("avatar",{
        storage:diskStorage({
            destination:path.join(__dirname,'../images'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            const authorized = new Set(["image/png","image/jpeg", 'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }
    }))
    async update(@UploadedFile() avatar, @Body() user:UpdateUserDto, @User() session){
        
        let avatar_name = "", path = "";
        if( avatar ){
            avatar_name = avatar.originalname;
            path = avatar.path;
        }
        const userExist = await this.userService.findById(user.userId);
        if(!userExist.length) throw new HttpException("USER NOT FOUND", HttpStatus.NOT_FOUND);

        if( user.email  ){
            const emailExit = await this.userService.findByEmail(user.email);
            if(emailExit.length && ( user.userId != emailExit[0]['id'] ) ) throw new HttpException("Email already exist", 410)
        }


        

        if( user.role ){
            const email = user.email || userExist[0]['email'];
            const emailExit = await this.userService.findByEmail(email);
            /**
             * Esta validación se efectua en caso de que el usuario ya este dos veces registrado con diferente rol
             * Asi evitamos que cambie sus dos usuarios al mismo rol
             */
            if(emailExit.length == 2){
                const validateUser = emailExit.find( e => e.id == user.userId)
                if( RolesDto[user.role] != validateUser.role_id ) throw new HttpException("Your user already has 2 roles",411)
            }
            //@ts-ignore
            user.role_id = RolesDto[user.role]
        }

        let schema = Object.assign({}, user,{modified_by:session.id})

        if(user.password){

            const email = user.email || userExist[0]['email'];
            const emailExit = await this.userService.findByEmail(email);
            const validateUser = emailExit.find( e => e.id != user.userId)
            
            if(validateUser){
                const samePassword = await this.userService.comparePassword(user.password, validateUser.password)
                if(samePassword) throw new HttpException("The password cannot be the same as that of your other user", 412);
            }
            const { hash, salt } = await this.userService.encrypt(user.password);
            schema.password = hash
            //@ts-ignore
            schema.salt = salt, schema.password_length = user.password.length;

        }

        
        delete schema.userId;
        delete schema.role
        if (avatar){  
            schema = Object.assign(schema,{
            avatar: avatar_name,
            path:path
        })}
        const updated = await this.userService.update(user.userId, schema);
        
        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "update";
        log.type = "update";
        log.element = user.userId;
        log.db_table = "users";
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);
        return user
    }


    @Delete()
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['D'])
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    @ApiNotFoundResponse({type:NotFoundDto})
    @ApiResponse({status:200, type:DeleteUserDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    async delete( @Body() id:DeleteUserDto, @User() session ){
        
        const userExist = await this.userService.findById(id.userId);
        if(!userExist.length) throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        const deleted = await this.userService.delete(id.userId);

        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "delete";
        log.type = "delete";
        log.element = id.userId;
        log.db_table = "users";
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);
        return id;
    }
}
