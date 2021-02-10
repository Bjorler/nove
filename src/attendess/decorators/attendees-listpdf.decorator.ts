import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PDFNotFoundDto, InternalServerErrrorDto } from '../../commons/DTO';
import { AttendeesBase64Dto } from '../DTO/attendees-base64.dto';
export function AttendeesListPdfDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to generate the attendance list of an event in PDF format"}),
        ApiResponse({status:200, type:AttendeesBase64Dto}),
        ApiNotFoundResponse({type:PDFNotFoundDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}