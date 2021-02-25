import { applyDecorators, SetMetadata, UsePipes, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiConsumes, ApiBody, ApiResponse, ApiNotFoundResponse,
ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiConflictResponse
} from '@nestjs/swagger';
import { ValidationPipe } from '../../commons/validations/validations.pipe';
import { TokenGuard, MasterGuard } from '../../commons/guards';
import { AttendeesNotFoundDto, PDFNotFoundDto, ImageErrorDto, SignatureErrorDto, UnauthorizedDto,
ForbiddenDto, InternalServerErrrorDto, AttendeesDuplicateDto
} from '../../commons/DTO';
import { AttendeesSignatureDto } from '../DTO/attendees-signature.dto';
import { AttendeesCreateResponseDto } from '../DTO/attendees-create-response.dto';

export function AttendeesSignDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to assign the signature to the PDF file"}),
        SetMetadata('roles',["MASTER","ADMIN"]),
        SetMetadata('permission',['U']),
        ApiHeader({
            name:"token",
            example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
        }),
        ApiConsumes('multipart/form-data'),
        ApiBody({type:AttendeesSignatureDto}),
        ApiConflictResponse({type:AttendeesDuplicateDto}),
        ApiResponse({status:200, type:AttendeesCreateResponseDto}),
        ApiNotFoundResponse({type: PDFNotFoundDto}),
        ApiNotFoundResponse({type:AttendeesNotFoundDto}),
        ApiResponse({status:413,type:ImageErrorDto}),
        ApiResponse({status:417,type:SignatureErrorDto}),
        ApiUnauthorizedResponse({type:UnauthorizedDto}),
        ApiForbiddenResponse({type:ForbiddenDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto}),    
        UseGuards(TokenGuard, MasterGuard),
        UsePipes(new ValidationPipe),
    )
}