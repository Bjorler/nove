import { applyDecorators, UsePipes, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiResponse, ApiNotFoundResponse, ApiUnauthorizedResponse,
ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { EventNotFound, UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto } from '../../commons/DTO';
import { EventsInfoDto } from '../DTO/events-info.dto';

export function EventsTimeLineDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to get the list of future events"}),
        SetMetadata('roles',["MASTER","ADMIN"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiResponse({status:200, type:[EventsInfoDto]}),
        ApiNotFoundResponse({type:EventNotFound}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard)
    )
}