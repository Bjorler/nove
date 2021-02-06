import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as _ from 'underscore';
import * as moment from 'moment';
import {  GraphEventsResponseDto } from './DTO/graph-eventsresponse.dto';

@Injectable()
export class GraphService {
    constructor(
        @InjectKnex() private knex:Knex
    ){}

    private translateMonth(month){
    let months = {
        "January":"Enero",
        "February":"Febrero",
        "March":"Marzo",
        "April":"Abril",
        "May":"Mayo",
        "June":"Junio",
        "July":"Julio",
        "August":"Agosto",
        "September":"Septiembre",
        "October":"Octubre",
        "November":"Noviembre",
        "December":"Diciembre"
    }
    return months[month]
    }

    private translateDay(day){
    let days = {
        "Monday":"Lunes",
        "Tuesday":"Martes",
        "Wednesday":"Miercoles",
        "Thursday":"Jueves",
        "Friday":"Viernes",
        "Saturday":"Sabado",
        "Sunday":"Domingo"
    }
    return days[day]
    }
    
    private fillResponse(response){
        let months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
        let result = []
        for(let month of months){
            
           let monthExist = response.find( e => e.name==month );
           
           if(!monthExist){ result.push({name:month, value:0}) }
           else{result.push(monthExist)}
        }
        return result
    }

    async groupByMonth(events){
        const groupByMonth = _.groupBy(events, (e) => this.translateMonth(moment(e.event_date).format("MMMM")) )
        let result = [];
        for(let month in groupByMonth){
            let info = new GraphEventsResponseDto();
            info.name = month;
            info.value = groupByMonth[month].length;
            result.push(info)
        }

        return this.fillResponse(result);
    }


}
