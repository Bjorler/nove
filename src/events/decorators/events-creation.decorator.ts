import { applyDecorators, UsePipes, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiResponse, ApiBadRequestResponse,
    ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { ImageErrorDto, EvetnDateErrorDto, ErrorDto, UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto,
DatesErrorDto, StartTimeErrorDto, EventsImageErrorDto, EventsDateErrorDto
} from '../../commons/DTO';
import { EventsCreateDto, EventsResponseDates } from '../DTO/events-create.dto';
export function EventsCreationDecorator(){
    return applyDecorators(
        ApiOperation({
            summary:"Api to create events",
            description:"Requires an image in png / jpeg / gif format and it must be sent in the image attribute"
        }),
        SetMetadata('roles',["MASTER","ADMINMENOR"]),
        SetMetadata('permission',['C']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard),
        ApiResponse({status:201,type:EventsResponseDates}),
        ApiResponse({status:413, type:ImageErrorDto}),
        ApiResponse({status:415, type:EvetnDateErrorDto}),
        ApiResponse({status:414, type:StartTimeErrorDto}),
        ApiResponse({status:417, type:EventsImageErrorDto}),
        ApiResponse({status:424, type:DatesErrorDto}),
        ApiResponse({status:425, type:EventsDateErrorDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}