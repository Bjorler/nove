import { applyDecorators, SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse,
ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { ErrorDto,UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto } from '../../commons/DTO';
import { DatabaseResponseByCedulaDto } from '../DTO/database-responsebycedula.dto';


export function DatabaseEmailSearchDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api para obtener información de un asistente por email"}),
        SetMetadata('roles',["MASTER","ADMIN"]),
        SetMetadata('permission',['R']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiResponse({status:200, type:DatabaseResponseByCedulaDto}),
        ApiBadRequestResponse({type:ErrorDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),  
        UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe)
    )
}