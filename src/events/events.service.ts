import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';
import { AttendessService } from '../attendess/attendess.service';
import { EventsResponse } from './DTO/events-response.dto';
import { EventsPaginationDto } from './DTO/events-pagination.dto';
import { EventsInfoDto } from './DTO/events-info.dto';
import { METHOD, PORT, DOMAIN } from '../config';

@Injectable()
export class EventsService {
    private TABLE = "events";
    constructor(
        @InjectKnex() private knex: Knex,
        private attendeesService:AttendessService
    ){}

    async save(event){
        const newEvent = await this.knex.table(this.TABLE).insert(event);
        return newEvent;
    }

    async findAll(pagination:EventsPaginationDto):Promise<EventsResponse[]>{
        let page = parseInt(pagination.page)
        let limit = parseInt(pagination.page_size)
        const offset = page == 1 ? 0 : (page-1)*limit
        const events = await this.getQuery(pagination.search_item, limit, offset, pagination.date_init, pagination.date_final)
        
        let result:EventsResponse[] = []

        for(let event of events){
            let info = new EventsResponse();
            info.id = event.id;
            info.name = event.name;
            info.location = event.address;
            info.event_date = event.event_date//moment(event.event_date).format("DD-MM-YYYY");
            //const total = await this.attendeesService.findTotalAttendeesByEvent(event.id);
            
            info.assistance = event.assistants;
            result.push(info)
        }
        return result;
    }

    private async getQuery(filter:string, limit:number, offset:number, init_date:string, final_date:string){
        let events = []
        events = await this.knex.table(this.TABLE).limit(limit).offset(offset)
        .where((builder) => {
            if(filter){
                if(isNaN(parseInt(filter))){
                    builder.where('name', 'like',`%${filter}%`)
                    .orWhere('address', 'like', `%${filter}%`)
                }else{
                    builder.where('assistants', '=',parseInt(filter))
                }
            }
            if(init_date && final_date){
                builder.where("event_date",'>=', init_date).andWhere("event_date", '<=', final_date)
            }
        }).andWhere({is_deleted:0})


        return events;
    }

    private async getQueryTotalPages(filter:string,  init_date:string, final_date:string){
        let events = []
        events = await this.knex.table(this.TABLE).count("id",{as:'total'})
        .where((builder) => {
            if(filter){
                if(isNaN(parseInt(filter))){
                    builder.where('name', 'like',`%${filter}%`)
                    .orWhere('address', 'like', `%${filter}%`)
                }else{
                    builder.where('assistants', '=',parseInt(filter))
                }
            }
            if(init_date && final_date){
                builder.where("event_date",'>=', init_date).andWhere("event_date", '<=', final_date)
            }
        }).andWhere({is_deleted:0})


        return events;
    }

    async totalPages(pagination:EventsPaginationDto){
        const limit = parseInt(pagination.page_size);
        //const count = await this.knex.table(this.TABLE).count("id",{as:'total'}).where({is_deleted:0})
        const count = await this.getQueryTotalPages(pagination.search_item, pagination.date_init, pagination.date_final)
        const total = count[0].total;
        //@ts-ignore
        let module = total % limit;
        //@ts-ignore
        let div = Math.floor(total/limit)
        let pages = div + ( module > 0 ? 1: 0 )
        return {pages, total}
    }

    async findById(eventId:number){
        const event = await this.knex.table(this.TABLE).where({id:eventId}).andWhere({is_deleted:0});
        return event;
    }

    async delete(eventId:number){
        const deleted = await this.knex.table(this.TABLE).update({is_deleted:1}).where({id:eventId});
        return deleted;
    }

    async update(event,eventId:number){
        const updated = await this.knex.table(this.TABLE).update(event).where({id:eventId});
        return updated;
    }

    async futureEvents(){
        const events = await this.knex.table(this.TABLE).where({is_deleted:0})
        .andWhere('event_date','>', moment().format("YYYY-MM-DD")).orderBy("event_date").limit(50)
        const result = [];
        for( let event of events ){
            let info = new EventsInfoDto();
            info.download_img = `${METHOD}://${DOMAIN}/events/image/${event.id}`;
            info.eventId = event.id;
            info.image_name = event.image;
            info.name = event.name;
            info.location = event.address;
            info.description = event.description;
            info.event_date = event.event_date;
            info.hour_init = event.hour_init;
            info.hour_end = event.hour_end;
            result.push(info);
        }
        return result;
    }

    async incrementAttendees(eventId:number, session){
        const event = await this.knex.table(this.TABLE).where({id:eventId});
        let count = event[0]['assistants']+1;
        const updated = await this.knex.table(this.TABLE).update({assistants:count, modified_by:session.id});
        return updated;
    }
}
