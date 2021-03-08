import { ApiProperty } from '@nestjs/swagger';
export class DatesErrorDto{
    @ApiProperty({
        type:Number,
        example:424
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"event_date must contain at least one valid date"
    })
    message:string
}