import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { AttendeesListDto } from './attendees-list.dto';
export class AttendeesResponseDto{
    @ApiProperty({
        type:Number,
        example:1
    })
    eventId:number;

    @ApiProperty({
        type:String,
        example:"Avances Tecnologicos de genética humana"
    })
    event_name:string;

    @ApiProperty({
        type:[AttendeesListDto],
    })
    items:AttendeesListDto[];

    @ApiProperty({
        type:Number,
        example:5,
        description:"Number of pages"
    })
    pages:number

    @ApiProperty({
        type:Number,
        example:60,
        description:"Number of items found"
    })
    totalFound: number;

}