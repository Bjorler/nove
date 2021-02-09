import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PDFNotFoundDto, InternalServerErrrorDto } from '../../commons/DTO';

export function AttendeesListPdfDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to generate the attendance list of an event in PDF format"}),
        ApiResponse({status:200, description:"Download the list of attendees in pdf"}),
        ApiNotFoundResponse({type:PDFNotFoundDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}