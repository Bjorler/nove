import { ApiProperty } from '@nestjs/swagger';
export class DatabaseExcelErrorDto{
    @ApiProperty({
        type:Number,
        example:418
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The file parameter is required"
    })
    message:string
}