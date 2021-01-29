import { Injectable } from '@nestjs/common';
import { Knex, InjectKnex } from 'nestjs-knex';
import { LogDto } from '../DTO'

@Injectable()
export class LogServices {
    constructor(
        @InjectKnex() private knex: Knex
    ){}

    async createLog(log:LogDto){
        await this.knex.table("login_and_modifications").insert(log);
    }
}
