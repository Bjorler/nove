import { applyDecorators, SetMetadata, UsePipes, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
        ApiNotFoundResponse, ApiResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto, NotFoundDto } from '../../commons/DTO';
import { UserDetailDto } from '../DTO/user-detail.dto';

export function  UserDetailDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to obtain the information of a specific user"}),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),
        ApiNotFoundResponse({type:NotFoundDto}),
        ApiResponse({status:200, type:UserDetailDto}),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard),
    )
}