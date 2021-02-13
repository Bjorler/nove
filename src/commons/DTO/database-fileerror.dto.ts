import { ApiProperty } from '@nestjs/swagger';
export class DatabaseFileErrorDto{
    @ApiProperty({
        type:Number,
        example:420
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"Wrong file format checks the data."
    })
    message:string
}