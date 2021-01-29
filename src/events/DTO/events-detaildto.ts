import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EventsDetailDto{
    @ApiProperty({
        type:String,
        example:1,
        description:"Identifier of the event to be searched"
    })
    @IsString()
    eventId:string;
}