import { applyDecorators, SetMetadata, UsePipes,UseGuards } from '@nestjs/common';
import { ApiOperation,ApiHeader,ApiResponse,ApiBadRequestResponse,ApiNotFoundResponse,
ApiUnauthorizedResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { ImageErrorDto,ErrorDto,NotFoundDto,UnauthorizedDto,ForbiddenDto } from '../../commons/DTO';
import { UserDto } from '../DTO/user.dto';
export function UserCreationDecorator(){
    return applyDecorators(
        ApiOperation({
            summary:"Api for creating users",
            description:"Requires uploading an image in png or jpg format, the image attribute must be called avatar"
        }),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['C']),
        ApiHeader({
            
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiResponse({status:201,type:UserDto}),
        ApiResponse({status:413, type:ImageErrorDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiNotFoundResponse({type:NotFoundDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        UsePipes(new ValidationPipe),
        UseGuards(TokenGuard, MasterGuard),
    )
}