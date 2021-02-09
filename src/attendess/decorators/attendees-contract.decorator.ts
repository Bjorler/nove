import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PDFNotFoundDto, InternalServerErrrorDto } from '../../commons/DTO';

export function AttendeesContractDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to download the pdf file of conditions of attendance to the event and hospitality"}),
        ApiResponse({status:200, description:"PDF donwload"}),
        ApiNotFoundResponse({type:PDFNotFoundDto}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}