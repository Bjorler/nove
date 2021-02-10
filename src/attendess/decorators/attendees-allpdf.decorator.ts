import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { AttendeesNotFoundDto } from '../../commons/DTO';
import { AttendeesBase64Dto } from '../DTO/attendees-base64.dto';

export function AttendeesAllPdfDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to download all the PDF files of the event attendees"}),
        ApiResponse({status:200, type:AttendeesBase64Dto}),
        ApiNotFoundResponse({type:AttendeesNotFoundDto})
    )
}