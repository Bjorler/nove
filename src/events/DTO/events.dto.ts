import { ApiProperty } from '@nestjs/swagger';
import { EventsResponse } from './events-response.dto';

export class EventsDto{
    @ApiProperty({
        type:Number,
        example: 10,
        description:"Number of pages"
    })
    pages:number;

    @ApiProperty({
        type:[EventsResponse]
    })
    items:EventsResponse[];

    @ApiProperty({
        type:Number,
        example:10
    })
    totalFound:number
}