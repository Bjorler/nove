import { applyDecorators, SetMetadata, UsePipes, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiNotFoundResponse, ApiResponse, ApiInternalServerErrorResponse,
ApiUnauthorizedResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { NotFoundDto, UsersDeleteYourSelfErrorDto, UsersDeleteMasterDto, InternalServerErrrorDto,
UnauthorizedDto, ForbiddenDto
} from '../../commons/DTO';
import { DeleteUserDto } from '../DTO/delete-user.dto';

export function UserDeleteDecorator(){
    return applyDecorators(
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiOperation({summary:"Api to delete users"}),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['D']),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard),
        ApiNotFoundResponse({type:NotFoundDto}),
        ApiResponse({status:200, type:DeleteUserDto}),
        ApiResponse({status:418, type:UsersDeleteYourSelfErrorDto}),
        ApiResponse({status:419, type:UsersDeleteMasterDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto})
    )
}