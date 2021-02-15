import { applyDecorators, SetMetadata, UsePipes, UseGuards } from '@nestjs/common';
import { ApiOperation,ApiHeader,ApiUnauthorizedResponse, ApiForbiddenResponse, 
    ApiInternalServerErrorResponse, ApiOkResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto } from '../../commons/DTO';
import { EventsTodaysListDto } from '../DTO/events-todayslist.dto';

export function EventsTodayListDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to obtain the events that are occurring or that will occur on the current day"}),
        SetMetadata('roles',["ADMIN"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiOkResponse({type:EventsTodaysListDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard)
    );
}