import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventsService } from '../events/events.service';
import { GraphService } from './graph.service';
import { AttendessService } from '../attendess/attendess.service';
import { GraphFilterDto } from './DTO/graph-events.dto';
import { GraphPieResponse } from './DTO/graph-pieresponse.dto';
import { GraphEventsDecorator, GraphAttendeesDecorator, GraphSpecialityDecorator, GraphBrandDecorator } from './decorators';

@ApiTags("Graphs")
@Controller('graph')
export class GraphController {
    constructor(
        private eventsService:EventsService,
        private graphService:GraphService,
        private attendeesService: AttendessService
    ){}
    @Get("/events")
    @GraphEventsDecorator()
    async events(@Query() filter:GraphFilterDto){
        
        if(!filter.year) filter.year = `${new Date().getFullYear()}`
        const events = await this.eventsService.findByYear(filter.year);
        const result = await this.graphService.groupByMonth(events);
        let response = new  GraphPieResponse();
        response.items = result;
        response.total_elements = events.length;
        return response;
    }

    @Get("/attendees")
    @GraphAttendeesDecorator()
    async attendees(@Query() filter:GraphFilterDto ){
        if(!filter.year) filter.year = `${new Date().getFullYear()}`
        const attendees = await this.attendeesService.findByYear(filter.year)
        const result = await this.graphService.groupByMonth(attendees);
        let response = new GraphPieResponse();
        response.items = result;
        response.total_elements = attendees.length;
        return response;
    }

    @Get('/speciality')
    @GraphSpecialityDecorator()
    async attendeesBySpeciality(@Query() filter:GraphFilterDto){
        
        if(!filter.year) filter.year = `${new Date().getFullYear()}`

        const attendees = await this.attendeesService.findByYear(filter.year);
        const groupBy = await this.graphService.groupBy(attendees, 'speciality');
        const format = await this.graphService.formatData(groupBy);
        let response = new GraphPieResponse();
        response.items = format;
        response.total_elements = attendees.length;
        return response;
    }

    @Get('/brand')
    @GraphBrandDecorator()
    async attendeesByBrand(@Query() filter:GraphFilterDto){
        if(!filter.year) filter.year = `${new Date().getFullYear()}`

        const attendees = await this.graphService.findByYear(filter.year);
        const groupBy = await this.graphService.groupBy(attendees, 'brand');
        const format = await this.graphService.formatData(groupBy);
        let response = new GraphPieResponse();
        response.items = format;
        response.total_elements = attendees.length;
        return response;
    }

}
