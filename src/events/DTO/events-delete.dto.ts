import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EventsDeleteDto{
    @ApiProperty({
        type:Number,
        example:1,
        description:"Identifier of the event to be deleted"
    })
    @IsNumber()
    eventId:number;
}