import { applyDecorators, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiNotFoundResponse, ApiResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ErrorDto, NotFoundDto,InternalServerErrrorDto, LogDto } from '../../commons/DTO';
import { ResponseDto, ResultDto } from '../DTO/response.dto';
import { ValidationPipe } from '../../commons/validations/validations.pipe';

export function AuthenticationDecorator(){
    return applyDecorators(
        ApiOperation({summary:"Api to login"}),
        ApiNotFoundResponse({
            description: "USER NOT FOUND",
            type: NotFoundDto
        }),
        ApiResponse({
            status:201,
            type:ResponseDto
        }),
        ApiResponse({
            status:400,
            type:ErrorDto,
            description:"Validation failed",
        }),
        ApiInternalServerErrorResponse({
            description:"Internal server error",
            type:InternalServerErrrorDto
        }),
        UsePipes(new ValidationPipe)
    )
}