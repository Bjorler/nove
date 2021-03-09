import { applyDecorators, SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation,ApiHeader, ApiConsumes, ApiUnauthorizedResponse,ApiForbiddenResponse,
    ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiResponse
 } from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards'
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto, AttendeesNotFoundDto, ImageErrorDto, SignatureErrorDto } from '../../commons/DTO';

export function AttendanceSignatureDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to save the attendance signature when an attendee is already registered"}),
        SetMetadata('roles',["ADMIN","MASTER"]),
        SetMetadata('permission',['C']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiConsumes('multipart/form-data'),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}), 
        ApiNotFoundResponse({type:AttendeesNotFoundDto}),
        ApiResponse({status:413,type:ImageErrorDto}),
        ApiResponse({status:417,type:SignatureErrorDto}),
        UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe),
    )
}