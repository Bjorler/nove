import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class EventsDetailDto{
    @ApiProperty({
        type:String,
        example:1,
        description:"Identifier of the event to be searched"
    })
    @IsString()
    eventId:string;

    @ApiProperty({
        type:String,
        example: '-5:00',
        description:"Time zone from front end"
    })
    @IsString()
    @IsNotEmpty()
    @Matches(new RegExp(/([-|+]?[01]?[0-9]|2[0-3]):[0-5][0-9]/))
    timeZone: string;
}

export class EventsTimelineDto{
    @ApiProperty({
        type:String,
        example: '-5:00',
        description:"Time zone from front end"
    })
    @IsString()
    @IsNotEmpty()
    @Matches(new RegExp(/([-|+]?[01]?[0-9]|2[0-3]):[0-5][0-9]/))
    timeZone: string;
}