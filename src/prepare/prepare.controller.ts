import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import * as path from 'path';
import { PrepareService } from './prepare.service';
import { EventsService } from '../events/events.service';
import { AttendessService } from '../attendess/attendess.service';

@Controller('prepare')
export class PrepareController {
    constructor(
        private prepareService:PrepareService,
        private eventsService:EventsService,
        private attendeesService: AttendessService
    ){}
    @Get("/users")
    @ApiExcludeEndpoint()
    async fillUser(){
        let image =  path.join(__dirname,'../../defaults/user.png');
        let avatar = "user.png"
        let users = await this.prepareService.getAllUsers();
        for(let user of users ){
            await this.prepareService.updateImage(image, avatar, user.id);
        }
    }

    @Get("/events")
    @ApiExcludeEndpoint()
    async fillEvents(){
        let url = path.join(__dirname,'../../defaults/img-event.png')
        let name = "img-event.png";

        let events = await this.prepareService.getAllEvents();
        for(let event of events){
            await this.prepareService.updateEvent(url,name, event.id);
        }
    }

    @Get('/attendees')
    @ApiExcludeEndpoint()
    async fillAttendees(){
        let attendees  = await this.prepareService.getAllAttendees();
        for(let item of attendees){
            console.log(item)
            const eventExist = await this.eventsService.findById(item.event_id);
            let question = JSON.parse(item.questions)
            let questions = {
                question1:question.question1,
                question2:question.question2,
                question3: question.question3,
                typeOfInstitution: question.typeOfInstitution,
                institutionName: question.institutionName,
                nameAndTitle: question.nameAndTitle,
                authorization: question.authorization,
                idengage: question.idengage
            }
            let pdf = await this.attendeesService.fillPDFFisrtPart(questions, item.name, eventExist);
            
            const updated = await this.attendeesService.setPdf(item.id, pdf, 1);
            
        }
    }

    @Get('/sign')
    @ApiExcludeEndpoint()
    async sign(){
        let url = path.join(__dirname,'../../defaults/firma.jpg')
        let attendees = await this.prepareService.getAllAttendees();
        for(let item  of attendees){
            await this.attendeesService.signPdf(item.pdf_path, url);
            await this.attendeesService.setSinature(item.id, url,1);
        }
    }
}
