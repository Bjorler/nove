import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
@Injectable()
export class PrepareService {
    constructor(
        @InjectKnex() private knex: Knex
    ){}

    async getAllUsers(){
        let users = await this.knex.table("users");
        return users;
    }
    async updateImage(image:string, avatar:string,id:number){
        await this.knex.table('users').update({path:image, avatar}).where({id:id});
    }

    async getAllEvents(){
        let events = await this.knex.table("events");
        return events;
    }

    async updateEvent(path:string, name:string, id:number){
        await this.knex.table("events").update({ image:name, path }).where({id});
    }

    async getAllAttendees(){
        let attendees = await this.knex.table('attendees');
        return attendees;
    }
}
