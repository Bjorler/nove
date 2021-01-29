import { ApiProperty }  from '@nestjs/swagger'
export class ErrorDetailDto{
    @ApiProperty({
        type:"string",
        example:"password should not be empty"
    })
    isNotEmpty:"string";

    @ApiProperty({
        type:"string",
        example:"password must be a string"
    })
    isString:"string"
}
export class ErrorMessageDto{
    @ApiProperty({
        type:"string",
        example:"password"
    })
    dataPath:string;

    @ApiProperty({
        type:ErrorDetailDto
    })
    error:ErrorDetailDto
}

export class ErrorDto{
    @ApiProperty({
        type:"number",
        example:400
    })
    statusCode:number;

    @ApiProperty({
        type:ErrorMessageDto
    })
    message:ErrorMessageDto[];
    error:"string";
}