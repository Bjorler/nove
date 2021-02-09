import { applyDecorators, SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiOkResponse, ApiUnauthorizedResponse,
ApiBadRequestResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { UnauthorizedDto, ErrorDto, ForbiddenDto, InternalServerErrrorDto } from '../../commons/DTO';

export function DatabaseExcelDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to get the latest excel loaded"}),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiOkResponse({description:"Download the last excel uploaded "}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),  
        //UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe)
    )
}