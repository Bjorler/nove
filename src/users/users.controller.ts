import { Controller, Post, Body, UploadedFile, UseInterceptors,  
    HttpException, HttpStatus, Get, Query, Param, Response, Put, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiNotFoundResponse, ApiResponse,
        ApiInternalServerErrorResponse, ApiOperation, ApiConsumes, ApiBody} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UsersService } from './users.service';
import { LogServices } from '../commons/services/log.service';
import { User } from '../commons/decoratos/user.decorator';
import { UserDto } from './DTO/user.dto';
import {  
    LogDto, InternalServerErrrorDto,  ImageNotFoundDto } from '../commons/DTO';
import { RolesDto } from '../commons/DTO/roles.dto';
import { PaginationDto } from './DTO/pagination.dto';
import { UpdateUserDto } from './DTO/updateuser.dto';
import { DeleteUserDto } from './DTO/delete-user.dto';
import { FindUserDto } from './DTO/find-user.dto';
import { UserDetailDto } from './DTO/user-detail.dto';
import { UserResponseDto } from './DTO/user-response.dto';
import { UserCreationDecorator, UserListDecorato, UserDetailDecorator,
    UserUpdateDecorator, UserDeleteDecorator
 } from './decorators'
import { METHOD, DOMAIN} from '../config';

import { ApiImplicitFormData } from './DTO/test.dto';

@ApiTags("Users")
@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
        private logService: LogServices
    ){}

    @Post()
    @ApiConsumes('multipart/form-data')
    @UserCreationDecorator()
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
            
            if(!samePassword && !sameRole && userExist.length < 2 ){
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
    @UserListDecorato()
    async find(@Query() page:PaginationDto ){
        
        page.limit = page.limit || 10;
        const pages = await this.userService.pages(page.limit);
        
        const users = await this.userService.findAll(page.limit, page.page)
        let response = new UserResponseDto();
        response.total_pages = pages;
        response.users = users;
        return response;
    }


    

    @Get('/image/:id')
    @ApiOperation({summary:"Api to download the image that the user uploaded"})
    
    @ApiResponse({status:200, description:"Download image"})
    @ApiNotFoundResponse({type:ImageNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async download(@Response() res ,@Param('id') id:number){
        const user = await this.userService.findById(id);
        if(!user.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = user[0].path;
        res.download(path)
    }

    @Get('/image')
    @ApiOperation({summary:"Api to download the image that the user uploaded"})
    
    @ApiResponse({status:200, description:"Download image"})
    @ApiNotFoundResponse({type:ImageNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async download_default(@Response() res ,@Param('id') id:number){
        res.download('./defaults/user.png')
        
    }

    @Put()
    @UserUpdateDecorator()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor("avatar",{
        storage:diskStorage({
            destination:path.join(__dirname,'../images'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                console.log("1")
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            console.log("2")
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
    @UserDeleteDecorator()
    async delete( @Body() id:DeleteUserDto, @User() session ){
        if(id.userId == session.id) throw new HttpException("You are not allowed to eliminate yourself", 418)
        const userExist = await this.userService.findById(id.userId);
        
        if(!userExist.length) throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        if(userExist[0].email == "admin@octopy.com" && userExist[0].role_id == 1 ) throw new HttpException("Unable to remove master user",419);
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

    @Get('/:id')
    @UserDetailDecorator()
    async findUser(@Param() id:FindUserDto ){
        
        const user = await this.userService.findById(id.id);
        if(!user.length) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        
        let userDetail = new UserDetailDto();
        userDetail.download_img = `${METHOD}://${DOMAIN}/users/image/${user[0].id}`;
        userDetail.default_img =  `${METHOD}://${DOMAIN}/users/image`;
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
}
