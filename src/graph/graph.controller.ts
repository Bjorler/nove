import { Controller, Get, Query, UsePipes, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiResponse,ApiOkResponse,ApiOperation, ApiHeader,
         ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
         ApiBadRequestResponse   
} from '@nestjs/swagger';
import { EventsService } from '../events/events.service';
import { GraphService } from './graph.service';
import { AttendessService } from '../attendess/attendess.service';
import {MasterGuard, TokenGuard} from '../commons/guards';
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto,ErrorDto } from '../commons/DTO';
import { GraphFilterDto } from './DTO/graph-events.dto';
import { ValidationPipe } from '../commons/validations/validations.pipe';
import { GraphEventsResponseDto } from './DTO/graph-eventsresponse.dto';
import { GraphPieResponse } from './DTO/graph-pieresponse.dto';

@ApiTags("Graphs")
@Controller('graph')
export class GraphController {
    constructor(
        private eventsService:EventsService,
        private graphService:GraphService,
        private attendeesService: AttendessService
    ){}
    @Get("/events")
    @ApiOperation({summary:"Api to obtain the graphs of the events by year"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiOkResponse({type:[GraphPieResponse]})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
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
    @ApiOperation({summary:"Api to obtain the graphs of the attendees by year"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiOkResponse({type:[GraphPieResponse]})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
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
    @ApiOperation({summary:"Api to obtain the total number of attendees by specialty and by year"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiOkResponse({type:[GraphPieResponse]})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
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
    @ApiOperation({summary:"Api to obtain the total number of attendees by brand and by year"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiOkResponse({type:[GraphPieResponse]})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
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
