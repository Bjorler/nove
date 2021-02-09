import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ImageNotFoundDto, InternalServerErrrorDto } from '../../commons/DTO';


export function AttendeesSignatureDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to download the image containing the user's signature"}),
        ApiResponse({status:200, description:"Download signature"}),
        ApiNotFoundResponse({type:ImageNotFoundDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}