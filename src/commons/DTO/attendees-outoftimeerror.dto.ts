import { ApiProperty } from '@nestjs/swagger';
export class EventsOutOfTimeDto{
    @ApiProperty({
        type:Number,
        example:423
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"EVENT OUT OF TIME"
    })
    message:string
}