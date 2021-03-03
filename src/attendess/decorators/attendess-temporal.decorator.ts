import { applyDecorators, SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiHeader, ApiBadRequestResponse, ApiNotFoundResponse,
ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,ApiConflictResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { ErrorDto, EventNotFound, UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto, 
AttendeesDuplicateDto, EventsOutOfTimeDto
} from "../../commons/DTO";
import { AttendeesCreateResponseDto } from '../DTO/attendees-create-response.dto';

export function AttendeesTemporalDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to register an attendee in an event"}),
        SetMetadata('roles',["MASTER","ADMIN"]),
        SetMetadata('permission',['C']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiResponse({status:200, type:AttendeesCreateResponseDto}),
        ApiConflictResponse({type:AttendeesDuplicateDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiNotFoundResponse({type:EventNotFound}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),   
        ApiResponse({status:423, type:EventsOutOfTimeDto}), 
        UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe),
    )
}