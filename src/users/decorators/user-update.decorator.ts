import { applyDecorators, UseGuards, UsePipes, SetMetadata } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiBadRequestResponse, ApiInternalServerErrorResponse,
        ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse,ApiResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { ErrorDto, InternalServerErrrorDto, UnauthorizedDto, ForbiddenDto, NotFoundDto,
        ImageErrorDto, EmailErrorDto, RoleRepatErrorDto, PasswordRepatErrorDto
} from '../../commons/DTO';
import { UpdateUserDto } from '../DTO/updateuser.dto';


export function UserUpdateDecorator(){
    return applyDecorators(
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiOperation({summary:"Api to update users",description:"submit only the fields that need to be updated, if it is required to update the image send it in the avatar attribute"}),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['U']),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiNotFoundResponse({type:NotFoundDto}),
        ApiResponse({status:413, type:ImageErrorDto}),
        ApiResponse({status:410, type:EmailErrorDto}),
        ApiResponse({status:411, type:RoleRepatErrorDto}),
        ApiResponse({status:412, type: PasswordRepatErrorDto}),
        ApiResponse({status:200, type:UpdateUserDto, description:"The example is assuming that all the parameters are sent, in case of not sending all it would only return the sent ones."}),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard)
    
    )
}