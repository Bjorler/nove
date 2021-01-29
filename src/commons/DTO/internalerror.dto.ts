import { ApiProperty } from '@nestjs/swagger';

export class InternalServerErrrorDto{
    @ApiProperty({
        type:"number",
        example:500
    })
    statusCode:number;

    @ApiProperty({
        type:"number",
        example:"Internal server error"
    })
    message:string
}