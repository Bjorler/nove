import { Controller, Post, Get, Put, Delete, Body, Query, Param, UseInterceptors, UploadedFile,
        HttpException, HttpStatus, Response
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {  ApiTags, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as moment from 'moment-timezone';
import * as path from 'path';
import { EventsService } from './events.service';
import { LogServices } from '../commons/services/log.service';
import { User } from '../commons/decoratos/user.decorator';
import { EventsCreateDto } from './DTO/events-create.dto';
import { LogDto } from '../commons/DTO';
import { EventsPaginationDto } from './DTO/events-pagination.dto';
import { EventsDto } from './DTO/events.dto';
import { EventsDeleteDto } from './DTO/events-delete.dto';
import { EventsDetailDto } from './DTO/events-detaildto';
import { EventsInfoDto } from './DTO/events-info.dto';
import { EventsUpdateDto } from './DTO/events-update-dto';
import { EventsTodaysListDto } from './DTO/events-todayslist.dto';
import { EventsCreationDecorator, EventsListDecorator, EventsDeleteDecorator,
EventsTimeLineDecorator, EventsImageDecorator, EventsUpdateDecorator, EventsDetailDecorator,
EventsTodayListDecorator
} from './decorators';
import { METHOD, DOMAIN, STATICS_EVENTS } from '../config';


@ApiTags("Events")
@Controller('events')
export class EventsController {
    private TABLE = "events"
    constructor(
        private eventService: EventsService,
        private logService: LogServices
    ){}

    @Post()
    @ApiConsumes('multipart/form-data')
    @EventsCreationDecorator()
    @UseInterceptors(FileInterceptor("image",{
        storage:diskStorage({
            destination:path.join(__dirname,STATICS_EVENTS),//Si esta ruta presenta agun error remplazarla por ./images
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


        let isDatesArray = this.eventService.parseToarray(event.event_date);
        if(!isDatesArray.length) throw new HttpException("event_date must contain at least one valid date",424)
        

        //const EVENT_DATE_IS_BEFORE_CURRENT_DATE = moment(event.event_date).isBefore(moment(moment().format("YYYY-MM-DD")))
        //const EVENT_DATE_IS_SAME_CURRENT_DATE = moment(event.event_date).isSame(moment(moment().format("YYYY-MM-DD")))  
        const isEventDataInPastTime = this.eventService.validateDates(isDatesArray); 
        
        if( isEventDataInPastTime /*EVENT_DATE_IS_BEFORE_CURRENT_DATE*/) {
            this.eventService.deleteImage(image.path)
            throw new HttpException("You cannot schedule an event on past dates.",415)
        }    
        
        //const IS_HOUR_END_BEFORE_CURRENTTIME = moment(event.hour_end,"HH:mm").isBefore(moment(moment().format("HH:mm"),"HH:mm"))
        const IS_HOUR_INIT_BEFORE_HOUR_END = moment(event.hour_init,"HH:mm").isAfter(moment(event.hour_end,"HH:mm"))
        const IS_HOUR_INIT_THE_SAME_AS_HOUR_END = moment(event.hour_init,"HH:mm").isSame(moment(event.hour_end,"HH:mm"))  
        if( IS_HOUR_INIT_BEFORE_HOUR_END || IS_HOUR_INIT_THE_SAME_AS_HOUR_END 
        ){
            if(image)this.eventService.deleteImage(image.path);
            throw new HttpException("You cannot schedule events with a start time equal to the end time, not an end time less than the start time",414)
        }
        /*if(EVENT_DATE_IS_SAME_CURRENT_DATE && IS_HOUR_END_BEFORE_CURRENTTIME){
            if(image)this.eventService.deleteImage(image.path);
            throw new HttpException("You cannot schedule events with a start time equal to the end time, not an end time less than the start time",414)
        }*/
        let image_name = "", path = ""
        let schema = Object.assign({}, event,{
            //event_date:new Date(event.event_date),
            created_by: session.id,
            modified_by:session.id
        });
        delete schema.event_date
        if(image){
            image_name = image.originalname;
            path = image.path;
            schema = Object.assign(schema, { image:image_name, path });   
        }

        const newEvent = await this.eventService.save(schema);
        console.log(newEvent)
        const event_dates = await this.eventService.saveEventDate(isDatesArray,newEvent[0], session);
        console.log(event_dates)

        /** CREATE LOG */
        let log  = new LogDto();
        log.new_change = "create";
        log.type = "create";
        log.element = newEvent[0];
        log.db_table = "events";
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);

        /** CREATE LOG EVENT DATE */
         log  = new LogDto();
        log.new_change = "create";
        log.type = "create";
        log.element = newEvent[0];
        log.db_table = "events_date";
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);
        //@ts-ignore
        event.event_date = isDatesArray
        return event;
    }

    @Get()
    @EventsListDecorator()
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
    @EventsDeleteDecorator()
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
    @EventsTimeLineDecorator()
    async getTimeLine(){
        
        const events = await this.eventService.futureEvents() 
        return events;
    }

    @Get('/todays-list')
    @EventsTodayListDecorator()
    async getTodaysList(){
        const initial_date = moment().format("YYYY-MM-DD")
        const final_date = moment().add(1,'d')
        .format("YYYY-MM-DD")
        const hour_init = moment().format("HH:00");
        
        const events = await this.eventService.getTodaysList(initial_date, final_date, hour_init);
       
        let result:EventsTodaysListDto[] = [];
        for(let event of events){
            let info = new EventsTodaysListDto();
            info.id = event.id;
            info.event_date = moment(event.event_date).format("DD-MM-YYYY");
            info.event_name = event.name;
            info.description = event.description;
            info.display_time = `${moment(event.hour_init,"HH:mm").format("HH:mm")} - ${moment(event.hour_end,"HH:mm").format("HH:mm")} Hrs`;
            info.hour_init = event.hour_init;
            info.hour_end = event.hour_end;
            info.download_img = `${METHOD}://${DOMAIN}/events/image/${event.id}`;
            info.default_img = `${METHOD}://${DOMAIN}/events/image`;
            info.ubication = event.address
            result.push(info)
        }

        return result;
    }


    @Get('/image/:id')
    @EventsImageDecorator()
    async download(@Response() res ,@Param('id') id:number){
        const event = await this.eventService.findById(id);
        if(!event.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = event[0].path;
        res.download(path)
    }

    @Get('/image')
    @EventsImageDecorator()
    async download_default(@Response() res ,@Param('id') id:number){
        
        res.download('./defaults/img-event.png');
    }

    @Put()
    @ApiConsumes('multipart/form-data')
    @EventsUpdateDecorator()
    @UseInterceptors(FileInterceptor("image",{
        storage:diskStorage({
            destination:path.join(__dirname,STATICS_EVENTS),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            
            const authorized = new Set(["image/png","image/jpeg",'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }
    }))
    async update(@UploadedFile() image ,@Body() event:EventsUpdateDto, @User() session ){
        
        const eventId = parseInt(event.eventId);

        const eventExist = await this.eventService.findById(eventId);
        if(!eventExist.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);        
        
        /** EVENT DATE VALIDATIONS */
        let isDatesArray = []
        if(event.event_date){
            let event_date_validation = event.event_date 
            isDatesArray = this.eventService.parseToarray(event.event_date);
            const isEventDataInPastTime = this.eventService.validateDates(isDatesArray); 
            //const EVENT_DATE_IS_BEFORE_CURRENT_DATE = moment(event_date_validation).isBefore(moment(moment().format("YYYY-MM-DD")))
            //const EVENT_DATE_IS_SAME_AS_CURRENT_DATE = moment(event_date_validation).isSame(moment(moment().format("YYYY-MM-DD")))   
            if(!isDatesArray.length) throw new HttpException("event_date must contain at least one valid date",424)
            if(isEventDataInPastTime) {throw new HttpException("You cannot schedule an event on past dates.",415)}  
            /*if(EVENT_DATE_IS_SAME_AS_CURRENT_DATE){
                let hour_end = event.hour_end || eventExist[0]['hour_end'];
                const IS_HOUR_END_BEFORE_CURRENTTIME = moment(hour_end,"HH:mm").isBefore(moment(moment().format("HH:mm"),"HH:mm"))
                if(IS_HOUR_END_BEFORE_CURRENTTIME)throw new HttpException("You cannot schedule events with a start time equal to the end time, not an end time less than the start time",414);
            }  */
        }

        /** EVENT HOUR VALIDATIONS */
        let hour_init_validation = event.hour_init  || eventExist[0]['hour_init'];
        let hour_end_validation = event.hour_end || eventExist[0]['hour_end'];    
        const IS_HOUR_INIT_BEFORE_HOUR_END = moment(hour_init_validation,"HH:mm").isAfter(moment(hour_end_validation,"HH:mm"))
        const IS_HOUR_INIT_THE_SAME_AS_HOUR_END = moment(hour_init_validation,"HH:mm").isSame(moment(hour_end_validation,"HH:mm"))  
        if( IS_HOUR_INIT_BEFORE_HOUR_END || IS_HOUR_INIT_THE_SAME_AS_HOUR_END 
        ){
            throw new HttpException("You cannot schedule events with a start time equal to the end time, not an end time less than the start time",414)
        }



        let eschema = Object.assign({}, event, {modified_by: session.id, modified_on:new Date()});
        if(event.event_date){ eschema = Object.assign(eschema, { event_date: new Date(event.event_date) }) }

        delete eschema.eventId;
        if( eschema.event_date ) delete eschema.event_date;
        
        let image_name = "", path = "";
        if(image){
            image_name = image.originalname;
            path = image.path;
            eschema = Object.assign(eschema, { image:image_name, path });   
        }
        
        
        const updated = await this.eventService.update(eschema,eventId);
        if(isDatesArray.length) await this.eventService.updateEventDates(isDatesArray, eventId, session);
        

        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "update";
        log.type = "update";
        log.element = eventId;
        log.db_table = this.TABLE;
        log.created_by = session.id;
        log.modified_by = session.id
        this.logService.createLog(log);
        /** CREATE LOG EVENTS DATES */
         log = new LogDto();
        log.new_change = "update and save new dates";
        log.type = "update";
        log.element = eventId;
        log.db_table = "events_date";
        log.created_by = session.id;
        log.modified_by = session.id
        this.logService.createLog(log);
        //@ts-ignore
        if(isDatesArray.length) event.event_date = isDatesArray
        return event;
    }


    @Get('/:eventId')
    @EventsDetailDecorator()
    async eventDetail(@Param() event:EventsDetailDto ){
        
        const eventExist = await this.eventService.findById(parseInt(event.eventId));
        if(!eventExist.length) throw new HttpException("EVENT NOT FUND",HttpStatus.NOT_FOUND);
        

        let response = new EventsInfoDto();
        response.eventId = eventExist[0].id;
        response.download_img = `${METHOD}://${DOMAIN}/events/image/${eventExist[0].id}`;
        response.default_img = `${METHOD}://${DOMAIN}/events/image`;
        response.image_name = eventExist[0].image;
        response.name = eventExist[0].name;
        response.location = eventExist[0].address;
        response.sede = eventExist[0].sede || ''
        response.description = eventExist[0].description;
        response.event_date  = this.eventService.displayDates(await this.eventService.getEventDates(eventExist[0].id)) //eventExist[0].event_date;
        response.hour_init = eventExist[0].hour_init;
        response.hour_end = eventExist[0].hour_end;

        return response;
    }
    
}

