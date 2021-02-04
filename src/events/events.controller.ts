import { Controller, Post, Get, Put, Delete, Body, Query, Param,
        UseGuards, UsePipes, SetMetadata, UseInterceptors, UploadedFile,
        HttpException, HttpStatus, Response
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags, ApiHeader, ApiInternalServerErrorResponse,
         ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiBadRequestResponse, 
         ApiOperation   
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as moment from 'moment';
import { EventsService } from './events.service';
import { LogServices } from '../commons/services/log.service';
import { ValidationPipe } from '../commons/validations/validations.pipe';
import { MasterGuard, TokenGuard } from '../commons/guards'
import { User } from '../commons/decoratos/user.decorator';
import { EventsCreateDto } from './DTO/events-create.dto';
import { LogDto, InternalServerErrrorDto, UnauthorizedDto, ForbiddenDto, ImageErrorDto,
         DateErrorDto, EventNotFound, ImageNotFoundDto, EvetnDateErrorDto, FilterDateErrorDto,
         ErrorDto   
} from '../commons/DTO';
import { EventsPaginationDto } from './DTO/events-pagination.dto';
import { EventsDto } from './DTO/events.dto';
import { EventsDeleteDto } from './DTO/events-delete.dto';
import { EventsDetailDto } from './DTO/events-detaildto';
import { EventsInfoDto } from './DTO/events-info.dto';
import { EventsUpdateDto } from './DTO/events-update-dto';
import { METHOD, DOMAIN, PORT } from '../config';


@ApiTags("Events")
@Controller('events')
export class EventsController {
    private TABLE = "events"
    constructor(
        private eventService: EventsService,
        private logService: LogServices
    ){}

    @Post()
    @ApiOperation({
        summary:"Api to create events",
        description:"Requires an image in png / jpeg / gif format and it must be sent in the image attribute"
    })
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['C'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    @ApiResponse({status:201,type:EventsCreateDto})
    @ApiResponse({status:413, type:ImageErrorDto})
    @ApiResponse({status:415, type:EvetnDateErrorDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @UseInterceptors(FileInterceptor("image",{
        storage:diskStorage({
            destination:path.join(__dirname,'../images'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            console.log(file)
            const authorized = new Set(["image/png","image/jpeg",'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }
    }))
    async create(@UploadedFile() image,@Body() event: EventsCreateDto, @User()session ){
        

        if(event.event_date){
            const date = new Date(event.event_date).getTime();
            const curreentDate = new Date().getTime()
            if(date < curreentDate) throw new HttpException("You cannot schedule an event on past dates.",414)
        }


        let image_name = "", path = ""
        let schema = Object.assign({}, event,{
            event_date:new Date(event.event_date),
            created_by: session.id,
            modified_by:session.id
        });
        if(image){
            image_name = image.originalname;
            path = image.path;
            schema = Object.assign(schema, { image:image_name, path });   
        }

        const newEvent = await this.eventService.save(schema);
        

        /** CREATE LOG */
        let log  = new LogDto();
        log.new_change = "create";
        log.type = "create";
        log.element = newEvent[0];
        log.db_table = "events";
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);

        return event;
    }

    @Get()
    @ApiOperation({summary:"Api to get the events"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    @ApiResponse({status:200, type:EventsDto})
    @ApiResponse({status:414, type:DateErrorDto})
    @ApiResponse({status:416, type:FilterDateErrorDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async findAll(@Query() pagination:EventsPaginationDto){
        
        if(pagination.date_init && !pagination.date_final ) throw new HttpException("The init_date and final_date fields are dependent", 414)
        if(!pagination.date_init && pagination.date_final ) throw new HttpException("The init_date and final_date fields are dependent", 414)
        
        if(pagination.date_init && pagination.date_final){
           
            const date = new Date(pagination.date_init).getTime();
            const curreentDate = new Date(pagination.date_final).getTime()
            
            if(date > curreentDate) throw new HttpException("The start date must be less than the end date",416)
        }



        const {pages, total} = await this.eventService.totalPages(pagination)
        const events = await this.eventService.findAll(pagination);
        
        let response = new EventsDto();
        response.pages = pages;
        response.items = events;
        response.totalFound = total;

        return response;
    }

    @Delete()
    @ApiOperation({summary:"Api to delete events"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['D'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:EventsDeleteDto})
    @ApiNotFoundResponse({type:EventNotFound})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    async delete(@Body() eventId: EventsDeleteDto, @User() session ){
        
        const eventExist = await this.eventService.findById(eventId.eventId);
        if(!eventExist.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);

        const deleted = await this.eventService.delete(eventId.eventId);
        
        /** CREATE LOG */
        const log = new LogDto();
        log.new_change = "delete";
        log.type = "delete";
        log.element = eventId.eventId;
        log.db_table = this.TABLE;
        log.created_by = session.id;
        log.modified_by = session.id;
        this.logService.createLog(log);

        return eventId
    }

    @Get("/timeline")
    @ApiOperation({summary:"Api to get the list of future events"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['D'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:[EventsInfoDto]})
    @ApiNotFoundResponse({type:EventNotFound})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    async getTimeLine(){
        const events = await this.eventService.futureEvents() 
        return events;
    }


    


    @Get('/image/:id')
    @ApiOperation({summary:"Api to download the image with which the event was created"})
    @ApiResponse({status:200, description:"Download image"})
    @ApiNotFoundResponse({type:ImageNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async download(@Response() res ,@Param('id') id:number){
        const event = await this.eventService.findById(id);
        if(!event.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = event[0].path;
        res.download(path)
    }

    @Put()
    @ApiOperation({
        summary:"Api to update events",
        description:"submit only the fields that need to be updated, if it is required to update the image send it in the image attribute"
    })
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['U'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:EventsUpdateDto})
    @ApiResponse({status:415, type:EvetnDateErrorDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:EventNotFound})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    @UseInterceptors(FileInterceptor("image",{
        storage:diskStorage({
            destination:path.join(__dirname,'../images'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            console.log(file)
            const authorized = new Set(["image/png","image/jpeg",'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }
    }))
    async update(@UploadedFile() image ,@Body() event:EventsUpdateDto, @User() session ){
        
        const eventId = parseInt(event.eventId);

        const eventExist = await this.eventService.findById(eventId);
        if(!eventExist.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);

        if(event.event_date){
            const date = new Date(event.event_date).getTime();
            const curreentDate = new Date().getTime()
            if(date < curreentDate) throw new HttpException("You cannot schedule an event on past dates",415)
        }

        let eschema = Object.assign({}, event, {modified_by: session.id, modified_on:new Date()});
        if(event.event_date) {  eschema = Object.assign(eschema, { event_date: new Date(event.event_date) }) }
        delete eschema.eventId;
        
        let image_name = "", path = "";
        if(image){
            image_name = image.originalname;
            path = image.path;
            eschema = Object.assign(eschema, { image:image_name, path });   
        }
        
        
        const updated = await this.eventService.update(eschema,eventId);
        

        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "update";
        log.type = "update";
        log.element = eventId;
        log.db_table = this.TABLE;
        log.created_by = session.id;
        log.modified_by = session.id
        this.logService.createLog(log);

        return event;
    }


    @Get('/:eventId')
    @ApiOperation({summary:"Api to obtain the information of a specific event"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:201, type:EventsInfoDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:EventNotFound})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    @UsePipes(new ValidationPipe)
    @UseGuards(TokenGuard, MasterGuard)
    async eventDetail(@Param() event:EventsDetailDto ){
        
        const eventExist = await this.eventService.findById(parseInt(event.eventId));
        if(!eventExist.length) throw new HttpException("EVENT NOT FUND",HttpStatus.NOT_FOUND);
        

        let response = new EventsInfoDto();
        response.eventId = eventExist[0].id;
        response.download_img = `${METHOD}://${DOMAIN}:${PORT}/events/image/${eventExist[0].id}`;
        response.image_name = eventExist[0].image;
        response.name = eventExist[0].name;
        response.location = eventExist[0].address;
        response.description = eventExist[0].description;
        response.event_date  = eventExist[0].event_date;
        response.hour_init = eventExist[0].hour_init;
        response.hour_end = eventExist[0].hour_end;

        return response;
    }
    
}

