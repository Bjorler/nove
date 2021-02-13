import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PDFNotFoundDto, InternalServerErrrorDto } from '../../commons/DTO';
import { AttendeesBase64Dto } from '../DTO/attendees-base64.dto';

export function AttendeesContractDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to download the pdf file of conditions of attendance to the event and hospitality"}),
        ApiResponse({status:200, type:AttendeesBase64Dto,description:"PDF donwload"}),
        ApiNotFoundResponse({type:PDFNotFoundDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}