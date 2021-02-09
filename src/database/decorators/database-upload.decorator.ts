import { applyDecorators, SetMetadata, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiConsumes, ApiBody, ApiCreatedResponse,
ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto } from '../../commons/DTO';
import { DatabaseFileDto } from '../DTO/database-file.dto';
import { DatabaseLastUploadDto } from '../DTO/database-lastloading.dto';

export function DatabaseUploadDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to upload assistants through an excel file"}),
        SetMetadata('roles',["MASTER"]),
        SetMetadata('permission',['C']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiConsumes('multipart/form-data'),
        ApiBody({type:DatabaseFileDto}),
        ApiCreatedResponse({type:DatabaseLastUploadDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),  
        UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe)
    )
}