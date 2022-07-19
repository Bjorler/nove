import { applyDecorators, SetMetadata, UsePipes, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse,
ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { DateErrorDto, FilterDateErrorDto, ErrorDto, UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto } from '../../commons/DTO';
import { EventsDto } from '../DTO/events.dto';

export function EventsListDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to get the events"}),
        SetMetadata('roles',["MASTER","ADMINMENOR"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard),
        ApiResponse({status:200, type:EventsDto}),
        ApiResponse({status:414, type:DateErrorDto}),
        ApiResponse({status:416, type:FilterDateErrorDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}