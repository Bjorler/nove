import { ApiProperty } from '@nestjs/swagger';
export class StartTimeErrorDto{
    @ApiProperty({
        type:Number,
        example:414
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"You cannot schedule events with a start time equal to the end time, not an end time less than the start time"
    })
    message:string
}