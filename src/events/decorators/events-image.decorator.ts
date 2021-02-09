import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ImageNotFoundDto, InternalServerErrrorDto } from '../../commons/DTO';

export function EventsImageDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to download the image with which the event was created"}),
        ApiResponse({status:200, description:"Download image"}),
        ApiNotFoundResponse({type:ImageNotFoundDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}