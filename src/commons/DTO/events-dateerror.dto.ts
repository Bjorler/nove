import { ApiProperty } from '@nestjs/swagger';
export class EventsDateErrorDto{
    @ApiProperty({
        type:Number,
        example:425
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"event_date must contain only 3 valid dates"
    })
    message:string
}