import { ApiProperty } from '@nestjs/swagger';
export class DateErrorDto{
    @ApiProperty({
        type:Number,
        example:414
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The init_date and final_date fields are dependent"
    })
    message:string
}