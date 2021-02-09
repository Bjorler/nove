import { applyDecorators, SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiOkResponse, ApiUnauthorizedResponse,
ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto, } from '../../commons/DTO';
import { DatabaseLastUploadDto } from '../DTO/database-lastloading.dto';


export function DataBaseLastUploadDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to obtain the information of the last excel file loaded"}),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiOkResponse({type:DatabaseLastUploadDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),  
        UseGuards(TokenGuard, MasterGuard)
    )
}