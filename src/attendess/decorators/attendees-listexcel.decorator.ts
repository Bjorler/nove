import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { EventNotFound, InternalServerErrrorDto } from '../../commons/DTO';

export function AttendeesListExcelDecorator(){
    return applyDecorators(
        ApiOperation({summary:"api to generate the attendance list in EXCEL format"}),
        ApiResponse({status:200, description:"Download the list of attendees in excel format"}),
        ApiNotFoundResponse({type:EventNotFound}),
        ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    )
}