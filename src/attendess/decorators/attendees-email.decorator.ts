import { applyDecorators,SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation,ApiHeader,ApiUnauthorizedResponse,ApiInternalServerErrorResponse,
        ApiForbiddenResponse, ApiExcludeEndpoint, ApiNotFoundResponse, ApiResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto, PDFNotFoundDto } from '../../commons/DTO';
import { ApiProperty } from '@nestjs/swagger';

class EmailResponseDto{
    @ApiProperty({example:"E-mail sent"}) message:string
}

export function AttendeesEmailDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to send the assistance contract to the attendees by email"}),
        SetMetadata('roles',["ADMIN","MASTER"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiResponse({status:200, type:EmailResponseDto}),
        ApiNotFoundResponse({type:PDFNotFoundDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),    
        UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe),
    )
}