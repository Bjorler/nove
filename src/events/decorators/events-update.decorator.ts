import { applyDecorators, UseGuards, UsePipes, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiHeader, ApiBadRequestResponse,
ApiNotFoundResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { EventNotFound,EvetnDateErrorDto,ErrorDto, UnauthorizedDto,ForbiddenDto, InternalServerErrrorDto,
DatesErrorDto,EventsDateErrorDto } from '../../commons/DTO';
import { EventsUpdateDto, EventsUpdateResponseDto } from '../DTO/events-update-dto'; 

export function EventsUpdateDecorator(){
    return applyDecorators(
        ApiOperation({
            summary:"Api to update events",
            description:"submit only the fields that need to be updated, if it is required to update the image send it in the image attribute"
        }),
        SetMetadata('roles',["MASTER","ADMINMENOR"]),
        SetMetadata('permission',['U']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiResponse({status:200, type:EventsUpdateResponseDto}),
        ApiResponse({status:415, type:EvetnDateErrorDto}),
        ApiResponse({status:424, type:DatesErrorDto}),
        ApiResponse({status:425, type:EventsDateErrorDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiNotFoundResponse({type:EventNotFound}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard)
    )
}