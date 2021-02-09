import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { AttendeesNotFoundDto } from '../../commons/DTO';

export function AttendeesAllPdfDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to download all the PDF files of the event attendees"}),
        ApiResponse({status:200, description:"Donwload attendee bundle in pdf"}),
        ApiNotFoundResponse({type:AttendeesNotFoundDto})
    )
}